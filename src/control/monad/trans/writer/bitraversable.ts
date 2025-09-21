import { BiTraversable, bitraversable as createBiTraversable, BaseImplementation } from 'data/bitraversable'
import { Traversable } from 'data/traversable'
import { Functor } from 'ghc/base/functor'
import { Foldable } from 'data/foldable'
import { Applicative } from 'ghc/base/applicative'
import { MinBox1 } from 'data/kind'
import { Tuple2Box } from 'ghc/base/tuple/tuple'
import { bitraversable as tupleBiTraversable } from 'ghc/base/tuple/tuple2-bitraversable'
import { WriterTBox, writerT } from './writer-t'
import { bifunctor as writerTBifunctor } from './bifunctor'
import { bifoldable as writerTBifoldable } from './bifoldable'

const base = (traversable: Traversable): BaseImplementation => {
    const tuple = tupleBiTraversable()

    return {
        bitraverse: <W1, A1, W2, A2>(
            app: Applicative,
            f: (a: W1) => MinBox1<W2>,
            g: (b: A1) => MinBox1<A2>,
            fab: WriterTBox<W1, A1>,
        ): MinBox1<WriterTBox<W2, A2>> =>
            app['<$>'](
                (inner: MinBox1<Tuple2Box<A2, W2>>) => writerT(() => inner),
                traversable.traverse(
                    app,
                    (value: Tuple2Box<A1, W1>) => tuple.bitraverse(app, g, f, value),
                    fab.runWriterT(),
                ),
            ),
    }
}

export const bitraversable = (functor: Functor, foldable: Foldable, traversable: Traversable): BiTraversable =>
    createBiTraversable(base(traversable), writerTBifunctor(functor), writerTBifoldable(foldable))
