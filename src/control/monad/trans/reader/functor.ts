import { Functor, functor as createFunctor, FunctorBase } from 'ghc/base/functor'
import { ReaderTBox, readerT } from './reader-t'
import type { Monad } from 'ghc/base/monad/monad'
import type { MinBox1 } from 'data/kind'

export interface ReaderTFunctor<R> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: ReaderTBox<R, A>): ReaderTBox<R, B>

    '<$>'<A, B>(f: (a: A) => B, fa: ReaderTBox<R, A>): ReaderTBox<R, B>

    '<$'<A, B>(a: A, fb: ReaderTBox<R, B>): ReaderTBox<R, A>

    '$>'<A, B>(fa: ReaderTBox<R, A>, b: B): ReaderTBox<R, B>

    '<&>'<A, B>(fa: ReaderTBox<R, A>, f: (a: A) => B): ReaderTBox<R, B>

    void<A>(fa: ReaderTBox<R, A>): ReaderTBox<R, []>
}

const base = <R>(m: Monad): FunctorBase => ({
    fmap: <A, B>(f: (a: A) => B, fa: ReaderTBox<R, A>): ReaderTBox<R, B> =>
        readerT((r: R) => m['<$>'](f as (a: A) => B, fa.runReaderT(r)) as unknown as MinBox1<B>),
})

export const functor = <R>(m: Monad): ReaderTFunctor<R> => createFunctor(base<R>(m)) as ReaderTFunctor<R>
