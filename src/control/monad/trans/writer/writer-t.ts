import { Box2, MinBox0, MinBox1, Type } from 'data/kind'
import { Tuple2Box, tuple2 } from 'ghc/base/tuple/tuple'
import type { Monad } from 'ghc/base/monad/monad'
import type { Monoid } from 'ghc/base/monoid'

export interface WriterT<W, A> {
    readonly runWriterT: () => MinBox1<Tuple2Box<A, W>>
}

export type WriterTBox<W, A> = WriterT<W, A> & Box2<W, A>

export type WriterTMinBox<W, A> = WriterT<W, MinBox0<A>> & Box2<W, MinBox0<A>>

export const writerT = <W, A>(fn: () => MinBox1<Tuple2Box<A, W>>): WriterTBox<W, A> => ({
    runWriterT: fn,
    // Binary placeholder for kind annotation
    kind: (_: '*') => (_: '*') => '*' as Type,
})

export const runWriterT = <W, A>(ma: WriterT<W, A>): MinBox1<Tuple2Box<A, W>> => ma.runWriterT()

export const tuple = tuple2

// lift :: MonadTrans t => Monoid w => m a -> WriterT w m a
export const lift = <W, A>(m: Monad, wMonoid: Monoid<W>, ma: MinBox1<A>): WriterTBox<W, A> =>
    writerT(() => m['<$>']((a: A) => tuple2(a, wMonoid.mempty as W), ma))
