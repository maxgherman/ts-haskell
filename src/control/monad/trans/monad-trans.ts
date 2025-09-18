import { MinBox1, Kind, Constraint } from 'data/kind'
import type { Monad } from 'ghc/base/monad/monad'
import type { Monoid } from 'ghc/base/monoid'
import { ReaderTBox, readerT as makeReaderT } from './reader/reader-t'
import { WriterTBox, writerT as makeWriterT } from './writer/writer-t'
import { StateTBox, stateT as makeStateT } from './state/state-t'
import { MaybeTBox, maybeT as makeMaybeT } from './maybe/maybe-t'
import { EitherTBox, eitherT as makeEitherT } from './either/either-t'
import { just } from 'ghc/base/maybe/maybe'
import { right, EitherBox } from 'data/either/either'
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

// MaybeT-specific MonadTrans exposing a precise return type
export interface MaybeTTrans extends MonadTrans {
    lift<A>(ma: MinBox1<A>): MaybeTBox<A>
}

// EitherT/ExceptT-specific MonadTrans exposing a precise return type
export interface EitherTTrans<E> extends MonadTrans {
    lift<A>(ma: MinBox1<A>): EitherTBox<E, A>
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

export const maybeT = (m: Monad): MaybeTTrans =>
    ({
        lift: <A>(ma: MinBox1<A>): MaybeTBox<A> => makeMaybeT(() => m['<$>']((a: A) => just(a as NonNullable<A>), ma)),
        kind: kindOf(null as unknown as MonadTrans) as (_: (_: (_: '*') => '*') => (_: '*') => '*') => 'Constraint',
    }) as MaybeTTrans

export const eitherT = <E>(m: Monad): EitherTTrans<E> =>
    ({
        lift: <A>(ma: MinBox1<A>): EitherTBox<E, A> =>
            makeEitherT(
                () =>
                    m['<$>']((a: A) => right<E, A>(a as NonNullable<A>) as EitherBox<E, A>, ma) as MinBox1<
                        EitherBox<E, A>
                    >,
            ),
        kind: kindOf(null as unknown as MonadTrans) as (_: (_: (_: '*') => '*') => (_: '*') => '*') => 'Constraint',
    }) as EitherTTrans<E>

// ExceptT behaves the same as EitherT
export type ExceptTTrans<E> = EitherTTrans<E>
export const exceptT = <E>(m: Monad): EitherTTrans<E> => eitherT<E>(m)
