// instance Monoid a => Applicative ((,) a) -- Defined in ‘GHC.Base’

import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { functor as createFunctor } from 'ghc/base/tuple/tuple2-functor'
import { Monoid } from 'ghc/base/monoid'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { curry, fst, snd, tuple2, Tuple2BoxT } from './tuple'
import { compose } from '../functions'

export interface Tuple2Applicative<T> extends Applicative {
    pure<A>(a: A): Tuple2BoxT<T, A>

    '<*>'<A, B>(f: Tuple2BoxT<T, FunctionArrow<A, B>>, fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: Tuple2BoxT<T, A>, fb: Tuple2BoxT<T, B>): Tuple2BoxT<T, C>

    '*>'<A, B>(fa: Tuple2BoxT<T, A>, fb: Tuple2BoxT<T, B>): Tuple2BoxT<T, B>

    '<*'<A, B>(fa: Tuple2BoxT<T, A>, fb: Tuple2BoxT<T, B>): Tuple2BoxT<T, B>

    '<**>'<A, B>(fa: Tuple2BoxT<T, A>, f: Tuple2BoxT<T, FunctionArrow<A, B>>): Tuple2BoxT<T, B>

    fmap<A, B>(f: (a: A) => B, fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>

    '<$>'<A, B>(f: (a: A) => B, fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>

    '<$'<A, B>(a: A, fb: Tuple2BoxT<T, B>): Tuple2BoxT<T, A>

    '$>'<A, B>(fa: Tuple2BoxT<T, A>, b: B): Tuple2BoxT<T, B>

    '<&>'<A, B>(fa: Tuple2BoxT<T, A>, f: (a: A) => B): Tuple2BoxT<T, B>

    void<A>(fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, []>
}

const baseImplementation = <T>(monoid: Monoid<T>): BaseImplementation => ({
    // pure x = (mempty, x)
    pure: <A>(a: NonNullable<A>): Tuple2BoxT<T, A> => tuple2(monoid.mempty, a),

    // (u, f) <*> (v,x) = (u <> v, f x)
    '<*>': <A, B>(f: Tuple2BoxT<T, FunctionArrow<A, B>>, fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B> => {
        const uv = monoid['<>'](fst(f), fst(fa))
        return tuple2(uv, snd(f)(snd(fa)))
    },

    // liftA2 f (u, x) (v, y) = (u <> v, f x y)
    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: Tuple2BoxT<T, A>, fb: Tuple2BoxT<T, B>): Tuple2BoxT<T, C> => {
        const uv = monoid['<>'](fst(fa), fst(fb))

        // tuple2(uv, f(snd(fa))(snd(fb)))
        return compose<Tuple2BoxT<T, B>, B, C, Tuple2BoxT<T, C>>(
            curry(tuple2)(uv),
            f(snd(fa)),
            (...t: Tuple2BoxT<T, B>) => snd(t),
        )(...fb)
    },
})

export const applicative = <T>(monoid: Monoid<T>): Tuple2Applicative<T> => {
    const base = baseImplementation(monoid)
    const functor = createFunctor<T>()
    return createApplicative(base, functor) as Tuple2Applicative<T>
}
