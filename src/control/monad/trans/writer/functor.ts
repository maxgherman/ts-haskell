import { Functor, functor as createFunctor, FunctorBase } from 'ghc/base/functor'
import type { Monad } from 'ghc/base/monad/monad'
import { WriterTBox, writerT } from './writer-t'
import { tuple2 } from 'ghc/base/tuple/tuple'
import type { MinBox1 } from 'data/kind'

export interface WriterTFunctor<W> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: WriterTBox<W, A>): WriterTBox<W, B>

    '<$>'<A, B>(f: (a: A) => B, fa: WriterTBox<W, A>): WriterTBox<W, B>

    '<$'<A, B>(a: A, fb: WriterTBox<W, B>): WriterTBox<W, A>

    '$>'<A, B>(fa: WriterTBox<W, A>, b: B): WriterTBox<W, B>

    '<&>'<A, B>(fa: WriterTBox<W, A>, f: (a: A) => B): WriterTBox<W, B>

    void<A>(fa: WriterTBox<W, A>): WriterTBox<W, []>
}

const base = <W>(m: Monad): FunctorBase => ({
    fmap: <A, B>(f: (a: A) => B, fa: WriterTBox<W, A>): WriterTBox<W, B> =>
        writerT(
            () =>
                m['<$>'](([a, w]: [A, W]) => tuple2(f(a), w) as unknown, fa.runWriterT()) as unknown as MinBox1<[B, W]>,
        ),
})

export const functor = <W>(m: Monad): WriterTFunctor<W> => createFunctor(base<W>(m)) as WriterTFunctor<W>
