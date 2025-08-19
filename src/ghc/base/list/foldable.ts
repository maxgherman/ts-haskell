import { FoldableBase, Foldable, foldable as createFoldable } from 'data/foldable'
import { $null, head, tail, ListBox } from './list'
import { Monoid } from 'ghc/base/monoid'
import { MinBox0 } from 'data/kind'

export interface ListFoldable<T> extends Foldable {
    foldMap<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: ListBox<A>): MinBox0<M>
    "foldMap'"<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: ListBox<A>): MinBox0<M>
    fold<M>(m: Monoid<M>, fa: ListBox<M>): MinBox0<M>
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: ListBox<A>): B
    "foldr'"<A, B>(f: (a: A, b: B) => B, b: B, fa: ListBox<A>): B
    foldl<A, B>(f: (b: B, a: A) => B, b: B, fa: ListBox<A>): B
    "foldl'"<A, B>(f: (b: B, a: A) => B, b: B, fa: ListBox<A>): B
    foldr1<A>(f: (a: A, b: A) => A, fa: ListBox<A>): A
    foldl1<A>(f: (a: A, b: A) => A, fa: ListBox<A>): A
    toList<A>(fa: ListBox<A>): ListBox<A>
    null<A>(fa: ListBox<A>): boolean
    length<A>(fa: ListBox<A>): number
    elem<A>(a: A, fa: ListBox<A>): boolean
    maximum(fa: ListBox<number>): number
    sum(fa: ListBox<number>): number
    product(fa: ListBox<number>): number
}

const base: FoldableBase = {
    foldr: <A, B>(f: (a: A, b: B) => B, b: B, fa: ListBox<A>): B => {
        if ($null(fa)) {
            return b
        }
        return f(head(fa), base.foldr(f, b, tail(fa)))
    },
}

export const foldable = createFoldable(base) as ListFoldable<unknown>
