import { Box2, MinBox0, MinBox1, Type } from 'data/kind'
import type { Monad } from 'ghc/base/monad/monad'

export interface ReaderT<R, A> {
    readonly runReaderT: (r: R) => MinBox1<A>
}

export type ReaderTBox<R, A> = ReaderT<R, A> & Box2<R, A>

export type ReaderTMinBox<R, A> = ReaderT<R, MinBox0<A>> & Box2<R, MinBox0<A>>

export const readerT = <R, A>(fn: (r: R) => MinBox1<A>): ReaderTBox<R, A> => ({
    runReaderT: fn,
    // Kind wise this is a binary constructor placeholder, sufficient for library usage
    kind: (_: '*') => (_: '*') => '*' as Type,
})

export const runReaderT = <R, A>(ma: ReaderT<R, A>, r: R): MinBox1<A> => ma.runReaderT(r)

export const lift = <R, A>(m: Monad, ma: MinBox1<A>): ReaderTBox<R, A> => readerT((_r: R) => ma)
