// instance Applicative Maybe -- Defined in ‘GHC.Base’

import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { just, nothing, $case, MaybeBox } from './maybe'
import { functor } from './functor'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface MaybeApplicative extends Applicative {
    pure<A>(a: NonNullable<A>): MaybeBox<A>

    '<*>'<A, B>(f: MaybeBox<FunctionArrow<A, B>>, fa: MaybeBox<A>): MaybeBox<B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, NonNullable<C>>, fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<C>

    '*>'<A, B>(fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<B>

    '<*'<A, B>(fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<A>

    '<**>'<A, B>(fa: MaybeBox<A>, f: MaybeBox<FunctionArrow<A, B>>): MaybeBox<B>

    fmap<A, B>(f: (a: A) => B, fa: MaybeBox<A>): MaybeBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: MaybeBox<A>): MaybeBox<B>

    '<$'<A, B>(a: A, fb: MaybeBox<B>): MaybeBox<A>

    '$>'<A, B>(fa: MaybeBox<A>, b: B): MaybeBox<B>

    '<&>'<A, B>(fa: MaybeBox<A>, f: (a: A) => B): MaybeBox<B>

    void<A>(fa: MaybeBox<A>): MaybeBox<[]>
}

const baseImplementation: BaseImplementation = {
    pure: <A>(a: NonNullable<A>): MaybeBox<A> => just(a),

    '<*>': <A, B>(f: MaybeBox<FunctionArrow<A, B>>, fa: MaybeBox<A>): MaybeBox<B> =>
        $case<FunctionArrow<A, B>, MaybeBox<B>>({
            nothing,
            just: (x) => functor.fmap(x, fa),
        })(f),

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, NonNullable<C>>, fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<C> =>
        $case<A, MaybeBox<C>>({
            just: (x) =>
                $case<B, MaybeBox<C>>({
                    just: (y) => just(f(x)(y)),
                    nothing,
                })(fb),
            nothing,
        })(fa),
}

export const applicative = createApplicative(baseImplementation, functor) as MaybeApplicative

applicative['*>'] = <A, B>(fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<B> =>
    $case<A, MaybeBox<B>>({
        just: (_) => fb,
        nothing,
    })(fa)
