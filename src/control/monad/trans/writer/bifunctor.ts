import { Bifunctor, bifunctor as createBifunctor, BifunctorBase } from 'data/bifunctor'
import { Functor } from 'ghc/base/functor'
import { Tuple2Box } from 'ghc/base/tuple/tuple'
import { bifunctor as tupleBifunctor } from 'ghc/base/tuple/tuple2-bifunctor'
import { WriterTBox, writerT } from './writer-t'

const base = (functor: Functor): BifunctorBase => {
    const tuple = tupleBifunctor()

    return {
        bimap: <W1, A1, W2, A2>(f: (a: W1) => W2, g: (b: A1) => A2, pab: WriterTBox<W1, A1>): WriterTBox<W2, A2> =>
            writerT(() => functor['<$>']((value: Tuple2Box<A1, W1>) => tuple.bimap(g, f, value), pab.runWriterT())),
    }
}

export const bifunctor = (functor: Functor): Bifunctor => createBifunctor(base(functor))
