import { Box2, MinBox0, Type } from 'data/kind'
import { tuple2, Tuple2Box } from 'ghc/base/tuple/tuple'

export interface State<S, A> {
    readonly runState: (s: S) => Tuple2Box<A, S>
}

export type StateBox<S, A> = State<S, A> & Box2<S, A>

export type StateMinBox<S, A> = State<S, MinBox0<A>> & Box2<S, MinBox0<A>>

export const state = <S, A>(fn: (s: S) => Tuple2Box<A, S>): StateBox<S, A> => ({
    runState: fn,
    kind: (_: '*') => (_: '*') => '*' as Type,
})

export const runState = <S, A>(sa: State<S, A>, s: S): Tuple2Box<A, S> => sa.runState(s)

export const evalState = <S, A>(sa: State<S, A>, s: S): A => sa.runState(s)[0]

export const execState = <S, A>(sa: State<S, A>, s: S): S => sa.runState(s)[1]

export const mapState = <S, A, B>(f: (as: Tuple2Box<A, S>) => Tuple2Box<B, S>, sa: StateBox<S, A>): StateBox<S, B> =>
    state((s: S) => f(sa.runState(s)))

export const withState = <S, A>(f: (s: S) => S, sa: StateBox<S, A>): StateBox<S, A> =>
    state((s: S) => sa.runState(f(s)))

export const get = <S>(): StateBox<S, S> => state((s: S) => tuple2(s, s))

export const put = <S>(s: S): StateBox<S, []> => state(() => tuple2([], s))

export const modify = <S>(f: (s: S) => S): StateBox<S, []> => state((s: S) => tuple2([], f(s)))

export const gets = <S, A>(f: (s: S) => A): StateBox<S, A> => state((s: S) => tuple2(f(s), s))
