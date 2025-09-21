import { Applicative } from 'ghc/base/applicative'
import { BiTraversable, bitraversable as createBiTraversable, BaseImplementation } from 'data/bitraversable'
import { bifunctor } from './tuple2-bifunctor'
import { bifoldable } from './tuple2-bifoldable'
import { tuple2, fst, snd, Tuple2Box } from './tuple'
import { MinBox1 } from 'data/kind'

export interface Tuple2BiTraversable extends BiTraversable {
    bitraverse<A, B, C, D>(
        app: Applicative,
        f: (a: A) => MinBox1<C>,
        g: (b: B) => MinBox1<D>,
        fab: Tuple2Box<A, B>,
    ): MinBox1<Tuple2Box<C, D>>
    bisequenceA<A, B>(app: Applicative, tfab: Tuple2Box<MinBox1<A>, MinBox1<B>>): MinBox1<Tuple2Box<A, B>>
}

const base: BaseImplementation = {
    bitraverse: <A, B, C, D>(
        app: Applicative,
        f: (a: A) => MinBox1<C>,
        g: (b: B) => MinBox1<D>,
        fab: Tuple2Box<A, B>,
    ): MinBox1<Tuple2Box<C, D>> => app.liftA2((c: C) => (d: D) => tuple2(c, d), f(fst(fab)), g(snd(fab))),
}

export const bitraversable = () => createBiTraversable(base, bifunctor(), bifoldable()) as Tuple2BiTraversable
