import { MinBox1, Kind, Constraint } from 'data/kind'
import type { Monad } from 'ghc/base/monad/monad'
import type { Monoid } from 'ghc/base/monoid'
import { ReaderTBox, readerT as makeReaderT } from './reader/reader-t'
import { WriterTBox, writerT as makeWriterT } from './writer/writer-t'
import { StateTBox, stateT as makeStateT } from './state/state-t'
import { tuple2 } from 'ghc/base/tuple/tuple'

export type MonadTransBase = {
    // lift :: Monad m => m a -> t m a
    lift<A>(ma: MinBox1<A>): MinBox1<A>
}

export type MonadTrans = MonadTransBase & {
    // kind :: ((* -> *) -> * -> *) -> Constraint
    kind: (_: (_: (_: '*') => '*') => (_: '*') => '*') => Constraint
}

export const kindOf =
    (_: MonadTrans): Kind =>
    (_: (_: (_: '*') => '*') => (_: '*') => '*') =>
        'Constraint' as Constraint

// ReaderT-specific MonadTrans exposing a precise return type
export interface ReaderTTrans<R> extends MonadTrans {
    lift<A>(ma: MinBox1<A>): ReaderTBox<R, A>
}

// WriterT-specific MonadTrans exposing a precise return type
export interface WriterTTrans<W> extends MonadTrans {
    lift<A>(ma: MinBox1<A>): WriterTBox<W, A>
}

// StateT-specific MonadTrans exposing a precise return type
export interface StateTTrans<S> extends MonadTrans {
    lift<A>(ma: MinBox1<A>): StateTBox<S, A>
}

export const readerT = <R>(m: Monad): ReaderTTrans<R> =>
    ({
        lift: <A>(ma: MinBox1<A>): ReaderTBox<R, A> => makeReaderT((_r: R) => ma),
        kind: kindOf(null as unknown as MonadTrans) as (_: (_: (_: '*') => '*') => (_: '*') => '*') => 'Constraint',
    }) as ReaderTTrans<R>

export const writerT = <W>(m: Monad, wMonoid: Monoid<W>): WriterTTrans<W> =>
    ({
        lift: <A>(ma: MinBox1<A>): WriterTBox<W, A> =>
            makeWriterT(() => m['<$>']((a: A) => tuple2(a, wMonoid.mempty as W), ma)),
        kind: kindOf(null as unknown as MonadTrans) as (_: (_: (_: '*') => '*') => (_: '*') => '*') => 'Constraint',
    }) as WriterTTrans<W>

export const stateT = <S>(m: Monad): StateTTrans<S> =>
    ({
        lift: <A>(ma: MinBox1<A>): StateTBox<S, A> => makeStateT((s: S) => m['<$>']((a: A) => tuple2(a, s), ma)),
        kind: kindOf(null as unknown as MonadTrans) as (_: (_: (_: '*') => '*') => (_: '*') => '*') => 'Constraint',
    }) as StateTTrans<S>
