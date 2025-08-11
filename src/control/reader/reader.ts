import { Box2, MinBox0, Type } from 'data/kind'

export interface Reader<R, A> {
    readonly runReader: (r: R) => A
}

export type ReaderBox<R, A> = Reader<R, A> & Box2<R, A>

export type ReaderMinBox<R, A> = Reader<R, MinBox0<A>> & Box2<R, MinBox0<A>>

export const reader = <R, A>(fn: (r: R) => A): ReaderBox<R, A> => ({
    runReader: fn,
    kind: (_: '*') => (_: '*') => '*' as Type,
})

export const runReader = <R, A>(ra: Reader<R, A>, r: R): A => ra.runReader(r)
