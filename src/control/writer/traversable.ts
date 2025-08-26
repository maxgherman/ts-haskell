import { Applicative } from 'ghc/base/applicative'
import { Traversable, traversable as createTraversable, BaseImplementation } from 'data/traversable'
import { WriterBox, writer } from './writer'
import { functor } from './functor'
import { foldable } from './foldable'
import { MinBox1 } from 'data/kind'
import { Tuple2Box, tuple2 } from 'ghc/base/tuple/tuple'

export interface WriterTraversable<W> extends Traversable {
    traverse<A, B>(app: Applicative, f: (a: A) => MinBox1<B>, ta: WriterBox<W, A>): MinBox1<WriterBox<W, B>>
    sequenceA<A>(app: Applicative, tfa: WriterBox<W, MinBox1<A>>): MinBox1<WriterBox<W, A>>
}

const base = <W>(): BaseImplementation => ({
    sequenceA: <A>(app: Applicative, tfa: WriterBox<W, MinBox1<A>>): MinBox1<WriterBox<W, A>> => {
        const [fa, w] = tfa.runWriter()
        return app['<$>']((a: A) => writer((): Tuple2Box<A, W> => tuple2(a, w)), fa)
    },
})

export const traversable = <W>() => createTraversable(base<W>(), functor<W>(), foldable<W>()) as WriterTraversable<W>
