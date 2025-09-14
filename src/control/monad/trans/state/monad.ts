import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { StateTBox, stateT } from './state-t'
import { applicative as createApplicative } from './applicative'

export interface StateTMonad<S> extends Monad {
    '>>='<A, B>(ma: StateTBox<S, A>, f: FunctionArrow<A, StateTBox<S, B>>): StateTBox<S, B>

    '>>'<A, B>(ma: StateTBox<S, A>, mb: StateTBox<S, B>): StateTBox<S, B>

    return<A>(a: NonNullable<A>): StateTBox<S, A>

    pure<A>(a: NonNullable<A>): StateTBox<S, A>

    '<*>'<A, B>(f: StateTBox<S, FunctionArrow<A, B>>, fa: StateTBox<S, A>): StateTBox<S, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: StateTBox<S, A>, fb: StateTBox<S, B>): StateTBox<S, C>

    '*>'<A, B>(fa: StateTBox<S, A>, fb: StateTBox<S, B>): StateTBox<S, B>

    '<*'<A, B>(fa: StateTBox<S, A>, fb: StateTBox<S, B>): StateTBox<S, A>

    '<**>'<A, B>(fa: StateTBox<S, A>, f: StateTBox<S, FunctionArrow<A, B>>): StateTBox<S, B>

    fmap<A, B>(f: (a: A) => B, fa: StateTBox<S, A>): StateTBox<S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: StateTBox<S, A>): StateTBox<S, B>

    '<$'<A, B>(a: A, fb: StateTBox<S, B>): StateTBox<S, A>

    '$>'<A, B>(fa: StateTBox<S, A>, b: B): StateTBox<S, B>

    '<&>'<A, B>(fa: StateTBox<S, A>, f: (a: A) => B): StateTBox<S, B>

    void<A>(fa: StateTBox<S, A>): StateTBox<S, []>
}

const baseImplementation = <S>(m: Monad) => ({
    '>>=': <A, B>(ma: StateTBox<S, A>, f: FunctionArrow<A, StateTBox<S, B>>): StateTBox<S, B> =>
        stateT((s0: S) => m['>>='](ma.runStateT(s0), ([a, s1]: [A, S]) => f(a).runStateT(s1))),
})

export const monad = <S>(m: Monad): StateTMonad<S> => {
    const base = baseImplementation<S>(m)
    const applicative = createApplicative<S>(m)
    return createMonad(base, applicative) as StateTMonad<S>
}
