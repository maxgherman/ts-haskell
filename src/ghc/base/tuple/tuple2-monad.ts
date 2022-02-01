// instance Monoid a => Monad ((,) a) -- Defined in ‘GHC.Base’

import { tuple2 } from './tuple'
import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { Monoid } from 'ghc/base/monoid'
import { Tuple2BoxT } from './tuple'
import { applicative as createApplicative } from 'ghc/base/tuple/tuple2-applicative'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface Tuple2Monad<T> extends Monad {
    '>>='<A, B>(ma: Tuple2BoxT<T, A>, f: FunctionArrow<A, Tuple2BoxT<T, B>>): Tuple2BoxT<T, B>

    '>>'<A, B>(ma: Tuple2BoxT<T, A>, mb: Tuple2BoxT<T, B>): Tuple2BoxT<T, B>

    return<A>(a: NonNullable<A>): Tuple2BoxT<T, A>

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

const baseImplementation = <T>(monoid: Monoid<T>) => ({
    // (u, a) >>= k = case k a of (v, b) -> (u <> v, b)
    '>>=': <A, B>(ma: Tuple2BoxT<T, A>, k: FunctionArrow<A, Tuple2BoxT<T, B>>): Tuple2BoxT<T, B> => {
        const [u, a] = ma
        const [v, b] = k(a)
        return tuple2(monoid['<>'](u, v), b)
    },
})

export const monad = <T>(monoid: Monoid<T>): Tuple2Monad<T> => {
    const base = baseImplementation(monoid)
    const applicative = createApplicative(monoid)
    return createMonad(base, applicative) as Tuple2Monad<T>
}
