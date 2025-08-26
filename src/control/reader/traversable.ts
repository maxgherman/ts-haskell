import { Applicative } from 'ghc/base/applicative'
import { Traversable, traversable as createTraversable, BaseImplementation } from 'data/traversable'
import { ReaderBox, reader } from './reader'
import { functor } from './functor'
import { foldable } from './foldable'
import { MinBox1 } from 'data/kind'

export interface ReaderTraversable<R> extends Traversable {
    traverse<A, B>(app: Applicative, f: (a: A) => MinBox1<B>, ta: ReaderBox<R, A>): MinBox1<ReaderBox<R, B>>
    sequenceA<A>(app: Applicative, tfa: ReaderBox<R, MinBox1<A>>): MinBox1<ReaderBox<R, A>>
}

const base = <R>(): BaseImplementation => ({
    sequenceA: <A>(app: Applicative, tfa: ReaderBox<R, MinBox1<A>>): MinBox1<ReaderBox<R, A>> =>
        app['<$>']((x: A) => reader(() => x), tfa.runReader(undefined as R)),
})

export const traversable = <R>() => createTraversable(base<R>(), functor<R>(), foldable<R>()) as ReaderTraversable<R>
