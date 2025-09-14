import { Functor, functor as createFunctor, FunctorBase } from 'ghc/base/functor'
import type { Monad } from 'ghc/base/monad/monad'
import { StateTBox, stateT } from './state-t'
import { tuple2 } from 'ghc/base/tuple/tuple'
import type { MinBox1 } from 'data/kind'

export interface StateTFunctor<S> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: StateTBox<S, A>): StateTBox<S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: StateTBox<S, A>): StateTBox<S, B>

    '<$'<A, B>(a: A, fb: StateTBox<S, B>): StateTBox<S, A>

    '$>'<A, B>(fa: StateTBox<S, A>, b: B): StateTBox<S, B>

    '<&>'<A, B>(fa: StateTBox<S, A>, f: (a: A) => B): StateTBox<S, B>

    void<A>(fa: StateTBox<S, A>): StateTBox<S, []>
}

const base = <S>(m: Monad): FunctorBase => ({
    fmap: <A, B>(f: (a: A) => B, fa: StateTBox<S, A>): StateTBox<S, B> =>
        stateT(
            (s: S) =>
                m['<$>'](([a, s1]: [A, S]) => tuple2(f(a), s1) as unknown, fa.runStateT(s)) as unknown as MinBox1<
                    [B, S]
                >,
        ),
})

export const functor = <S>(m: Monad): StateTFunctor<S> => createFunctor(base<S>(m)) as StateTFunctor<S>
