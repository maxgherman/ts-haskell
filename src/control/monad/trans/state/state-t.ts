import { Box2, MinBox0, MinBox1, Type } from 'data/kind'
import { Tuple2Box, tuple2 } from 'ghc/base/tuple/tuple'

export interface StateT<S, A> {
    readonly runStateT: (s: S) => MinBox1<Tuple2Box<A, S>>
}

export type StateTBox<S, A> = StateT<S, A> & Box2<S, A>

export type StateTMinBox<S, A> = StateT<S, MinBox0<A>> & Box2<S, MinBox0<A>>

export const stateT = <S, A>(fn: (s: S) => MinBox1<Tuple2Box<A, S>>): StateTBox<S, A> => ({
    runStateT: fn,
    // Binary placeholder kind
    kind: (_: '*') => (_: '*') => '*' as Type,
})

export const runStateT = <S, A>(ma: StateT<S, A>, s: S): MinBox1<Tuple2Box<A, S>> => ma.runStateT(s)

export const tuple = tuple2

// lift :: Monad m => m a -> StateT s m a
import type { Monad } from 'ghc/base/monad/monad'

export const lift = <S, A>(m: Monad, ma: MinBox1<A>): StateTBox<S, A> =>
    stateT((s: S) => m['<$>']((a: A) => tuple2(a, s), ma))
