import { tuple2, fst, snd, Tuple2Box } from './tuple'
import { BifunctorBase, Bifunctor, bifunctor as createBifunctor } from 'data/bifunctor'

export interface Tuple2Bifunctor extends Bifunctor {
    bimap<A, B, C, D>(f: (a: A) => C, g: (b: B) => D, pab: Tuple2Box<A, B>): Tuple2Box<C, D>

    first<A, B, C>(f: (a: A) => C, pab: Tuple2Box<A, B>): Tuple2Box<C, B>

    second<A, B, D>(g: (b: B) => D, pab: Tuple2Box<A, B>): Tuple2Box<A, D>
}

const base: BifunctorBase = {
    bimap: <A, B, C, D>(f: (a: A) => C, g: (b: B) => D, pab: Tuple2Box<A, B>): Tuple2Box<C, D> =>
        tuple2(f(fst(pab)), g(snd(pab))),
}

export const bifunctor = () => createBifunctor(base) as Tuple2Bifunctor
