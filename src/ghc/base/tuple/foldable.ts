import { Tuple2Box } from './tuple'
import { FoldableBase, Foldable, foldable as createFoldable } from 'data/foldable'
import { Monoid } from 'ghc/base/monoid'
import { ListBox } from 'ghc/base/list/list'
import { MinBox0 } from 'data/kind'

export interface Tuple2Foldable<T> extends Foldable {
    foldMap<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: Tuple2Box<T, A>): MinBox0<M>
    "foldMap'"<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: Tuple2Box<T, A>): MinBox0<M>
    fold<M>(m: Monoid<M>, fa: Tuple2Box<T, M>): MinBox0<M>
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: Tuple2Box<T, A>): B
    "foldr'"<A, B>(f: (a: A, b: B) => B, b: B, fa: Tuple2Box<T, A>): B
    foldl<A, B>(f: (b: B, a: A) => B, b: B, fa: Tuple2Box<T, A>): B
    "foldl'"<A, B>(f: (b: B, a: A) => B, b: B, fa: Tuple2Box<T, A>): B
    foldr1<A>(f: (a: A, b: A) => A, fa: Tuple2Box<T, A>): A
    foldl1<A>(f: (a: A, b: A) => A, fa: Tuple2Box<T, A>): A
    toList<A>(fa: Tuple2Box<T, A>): ListBox<A>
    null<A>(fa: Tuple2Box<T, A>): boolean
    length<A>(fa: Tuple2Box<T, A>): number
    elem<A>(a: A, fa: Tuple2Box<T, A>): boolean
    maximum(fa: Tuple2Box<T, number>): number
    sum(fa: Tuple2Box<T, number>): number
    product(fa: Tuple2Box<T, number>): number
}

const base = <T>(): FoldableBase => ({
    foldr: <A, B>(f: (a: A, b: B) => B, b: B, fa: Tuple2Box<T, A>): B => f(fa[1], b),
})

export const foldable = <T>() => createFoldable(base<T>()) as Tuple2Foldable<T>
