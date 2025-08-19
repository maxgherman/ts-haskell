import { PromiseBox } from './promise'
import { FoldableBase, Foldable, foldable as createFoldable } from 'data/foldable'
import { Monoid } from 'ghc/base/monoid'
import { ListBox } from 'ghc/base/list/list'

export interface PromiseFoldable extends Foldable {
    foldMap<A, M>(m: Monoid<M>, f: (a: A) => M, fa: PromiseBox<A>): M
    "foldMap'"<A, M>(m: Monoid<M>, f: (a: A) => M, fa: PromiseBox<A>): M
    fold<M>(m: Monoid<M>, fa: PromiseBox<M>): M
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: PromiseBox<A>): B
    "foldr'"<A, B>(f: (a: A, b: B) => B, b: B, fa: PromiseBox<A>): B
    foldl<A, B>(f: (b: B, a: A) => B, b: B, fa: PromiseBox<A>): B
    "foldl'"<A, B>(f: (b: B, a: A) => B, b: B, fa: PromiseBox<A>): B
    foldr1<A>(f: (a: A, b: A) => A, fa: PromiseBox<A>): A
    foldl1<A>(f: (a: A, b: A) => A, fa: PromiseBox<A>): A
    toList<A>(fa: PromiseBox<A>): ListBox<A>
    null<A>(fa: PromiseBox<A>): boolean
    length<A>(fa: PromiseBox<A>): number
    elem<A>(a: A, fa: PromiseBox<A>): boolean
    maximum(fa: PromiseBox<number>): number
    sum(fa: PromiseBox<number>): number
    product(fa: PromiseBox<number>): number
}

const base: FoldableBase = {
    foldr: <A, B>(_f: (a: A, b: B) => B, b: B, _fa: PromiseBox<A>): B => b,
}

export const foldable = createFoldable(base) as PromiseFoldable
