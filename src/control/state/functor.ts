import { Functor, FunctorBase, functor as createFunctor } from 'ghc/base/functor'
import { state, StateBox } from './state'
import { tuple2, Tuple2Box } from 'ghc/base/tuple/tuple'

export interface StateFunctor<S> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: StateBox<S, A>): StateBox<S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: StateBox<S, A>): StateBox<S, B>

    '<$'<A, B>(a: A, fb: StateBox<S, B>): StateBox<S, A>

    '$>'<A, B>(fa: StateBox<S, A>, b: B): StateBox<S, B>

    '<&>'<A, B>(fa: StateBox<S, A>, f: (a: A) => B): StateBox<S, B>

    void<A>(fa: StateBox<S, A>): StateBox<S, []>
}

const fmap = <S>(): FunctorBase => ({
    // fmap :: State s => (a -> b) -> State s a -> State s b
    fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: StateBox<S, A>): StateBox<S, B> =>
        state((s: S) => {
            const [a, s1] = fa.runState(s)
            return tuple2(f(a), s1) as Tuple2Box<B, S>
        }),
})

export const functor = <S>() => createFunctor(fmap<S>()) as StateFunctor<S>
