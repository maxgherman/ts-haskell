import { Applicative, BaseImplementation, applicative as createApplicative } from 'ghc/base/applicative'
import { state, StateBox } from './state'
import { functor as createFunctor } from './functor'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { tuple2 } from 'ghc/base/tuple/tuple'

export interface StateApplicative<S> extends Applicative {
    pure<A>(a: A): StateBox<S, A>

    '<*>'<A, B>(f: StateBox<S, FunctionArrow<A, B>>, fa: StateBox<S, A>): StateBox<S, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: StateBox<S, A>, fb: StateBox<S, B>): StateBox<S, C>

    '*>'<A, B>(fa: StateBox<S, A>, fb: StateBox<S, B>): StateBox<S, B>

    '<*'<A, B>(fa: StateBox<S, A>, fb: StateBox<S, B>): StateBox<S, A>

    '<**>'<A, B>(fa: StateBox<S, A>, f: StateBox<S, FunctionArrow<A, B>>): StateBox<S, B>

    fmap<A, B>(f: (a: A) => B, fa: StateBox<S, A>): StateBox<S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: StateBox<S, A>): StateBox<S, B>

    '<$'<A, B>(a: A, fb: StateBox<S, B>): StateBox<S, A>

    '$>'<A, B>(fa: StateBox<S, A>, b: B): StateBox<S, B>

    '<&>'<A, B>(fa: StateBox<S, A>, f: (a: A) => B): StateBox<S, B>

    void<A>(fa: StateBox<S, A>): StateBox<S, []>
}

const baseImplementation = <S>(): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): StateBox<S, A> => state((s: S) => tuple2(a, s)),

    '<*>': <A, B>(f: StateBox<S, FunctionArrow<A, B>>, fa: StateBox<S, A>): StateBox<S, B> =>
        state((s: S) => {
            const [fn, s1] = f.runState(s)
            const [a, s2] = fa.runState(s1)
            return tuple2(fn(a), s2)
        }),

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: StateBox<S, A>, fb: StateBox<S, B>): StateBox<S, C> =>
        state((s: S) => {
            const [a, s1] = fa.runState(s)
            const [b, s2] = fb.runState(s1)
            return tuple2(f(a)(b), s2)
        }),
})

export const applicative = <S>(): StateApplicative<S> => {
    const functor = createFunctor<S>()
    const base = baseImplementation<S>()
    return createApplicative(base, functor) as StateApplicative<S>
}
