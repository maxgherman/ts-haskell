import { BiFoldable, bifoldable as createBiFoldable, BiFoldableBase } from 'data/bifoldable'
import { Foldable } from 'data/foldable'
import { Monoid } from 'ghc/base/monoid'
import { MinBox0 } from 'data/kind'
import { Tuple2Box } from 'ghc/base/tuple/tuple'
import { bifoldable as tupleBifoldable } from 'ghc/base/tuple/tuple2-bifoldable'
import { WriterTBox } from './writer-t'

const base = (foldable: Foldable): BiFoldableBase => {
    const tuple = tupleBifoldable()

    return {
        bifoldMap: <W1, A1, M>(
            m: Monoid<M>,
            f: (a: W1) => MinBox0<M>,
            g: (b: A1) => MinBox0<M>,
            fab: WriterTBox<W1, A1>,
        ): MinBox0<M> =>
            foldable.foldMap(m, (value: Tuple2Box<A1, W1>) => tuple.bifoldMap(m, g, f, value), fab.runWriterT()),
    }
}

export const bifoldable = (foldable: Foldable): BiFoldable => createBiFoldable(base(foldable))
