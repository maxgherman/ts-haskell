import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import type { Monad } from 'ghc/base/monad/monad'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { StateTBox, stateT } from './state-t'
import { functor as createFunctor } from './functor'
import { tuple2 } from 'ghc/base/tuple/tuple'

export interface StateTApplicative<S> extends Applicative {
    pure<A>(a: A): StateTBox<S, A>

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

const baseImpl = <S>(m: Monad): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): StateTBox<S, A> => stateT((s: S) => m.pure(tuple2(a, s))),

    '<*>': <A, B>(f: StateTBox<S, FunctionArrow<A, B>>, fa: StateTBox<S, A>): StateTBox<S, B> =>
        stateT((s0: S) =>
            m['>>='](f.runStateT(s0), ([g, s1]: [(a: A) => B, S]) =>
                m['>>='](fa.runStateT(s1), ([a, s2]: [A, S]) => m.return(tuple2(g(a), s2))),
            ),
        ),

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: StateTBox<S, A>, fb: StateTBox<S, B>): StateTBox<S, C> =>
        stateT((s0: S) =>
            m['>>='](fa.runStateT(s0), ([a, s1]: [A, S]) =>
                m['>>='](fb.runStateT(s1), ([b, s2]: [B, S]) => m.return(tuple2(f(a)(b), s2))),
            ),
        ),
})

export const applicative = <S>(m: Monad): StateTApplicative<S> => {
    const functor = createFunctor<S>(m)
    return createApplicative(baseImpl<S>(m), functor) as StateTApplicative<S>
}
