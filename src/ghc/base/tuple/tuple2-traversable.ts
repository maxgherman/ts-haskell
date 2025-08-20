import { Applicative } from 'ghc/base/applicative'
import { Traversable, traversable as createTraversable, BaseImplementation } from 'ghc/base/traversable'
import { functor } from './tuple2-functor'
import { foldable } from './foldable'
import { tuple2, Tuple2Box, fst, snd } from './tuple'
import { MinBox1 } from 'data/kind'

export interface Tuple2Traversable<T> extends Traversable {
    traverse<A, B>(app: Applicative, f: (a: A) => MinBox1<B>, ta: Tuple2Box<T, A>): MinBox1<Tuple2Box<T, B>>
    sequenceA<A>(app: Applicative, tfa: Tuple2Box<T, MinBox1<A>>): MinBox1<Tuple2Box<T, A>>
}

const base = <T>(): BaseImplementation => ({
    sequenceA: <A>(app: Applicative, tfa: Tuple2Box<T, MinBox1<A>>): MinBox1<Tuple2Box<T, A>> =>
        app['<$>']((y: A) => tuple2(fst(tfa), y), snd(tfa)),
})

export const traversable = <T>() => createTraversable(base<T>(), functor<T>(), foldable<T>()) as Tuple2Traversable<T>
