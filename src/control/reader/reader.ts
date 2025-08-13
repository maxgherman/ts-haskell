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

export const mapReader = <R, A, B>(f: (a: A) => B, ra: ReaderBox<R, A>): ReaderBox<R, B> =>
    reader((r: R) => f(ra.runReader(r)))

export const withReader = <R, RPrime, A>(f: (r: RPrime) => R, ra: ReaderBox<R, A>): ReaderBox<RPrime, A> =>
    reader((r: RPrime) => ra.runReader(f(r)))

export const ask = <R>(): ReaderBox<R, R> => reader((r: R) => r)

export const asks = <R, A>(f: (r: R) => A): ReaderBox<R, A> => reader((r: R) => f(r))

export const local = <R, A>(f: (r: R) => R, ma: ReaderBox<R, A>): ReaderBox<R, A> =>
    reader((r: R) => ma.runReader(f(r)))
