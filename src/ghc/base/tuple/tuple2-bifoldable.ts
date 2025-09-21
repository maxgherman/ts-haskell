import { fst, snd, Tuple2Box } from './tuple'
import { BiFoldable, bifoldable as createBiFoldable, BiFoldableBase } from 'data/bifoldable'
import { Monoid } from 'ghc/base/monoid'
import { MinBox0 } from 'data/kind'

export interface Tuple2BiFoldable extends BiFoldable {
    bifoldMap<A, B, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, g: (b: B) => MinBox0<M>, fab: Tuple2Box<A, B>): MinBox0<M>
}

const base: BiFoldableBase = {
    bifoldMap: <A, B, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, g: (b: B) => MinBox0<M>, fab: Tuple2Box<A, B>) =>
        m['<>'](f(fst(fab)), g(snd(fab))) as MinBox0<M>,
}

export const bifoldable = () => createBiFoldable(base) as Tuple2BiFoldable
