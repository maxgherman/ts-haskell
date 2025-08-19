import { FoldableBase, Foldable, foldable as createFoldable } from 'data/foldable'
import { head, tail, NonEmptyBox } from './list'
import { $null, head as listHead, tail as listTail, ListBox } from 'ghc/base/list/list'
import { Monoid } from 'ghc/base/monoid'

export interface NonEmptyFoldable<T> extends Foldable {
    foldMap<A, M>(m: Monoid<M>, f: (a: A) => M, fa: NonEmptyBox<A>): M
    "foldMap'"<A, M>(m: Monoid<M>, f: (a: A) => M, fa: NonEmptyBox<A>): M
    fold<M>(m: Monoid<M>, fa: NonEmptyBox<M>): M
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: NonEmptyBox<A>): B
    "foldr'"<A, B>(f: (a: A, b: B) => B, b: B, fa: NonEmptyBox<A>): B
    foldl<A, B>(f: (b: B, a: A) => B, b: B, fa: NonEmptyBox<A>): B
    "foldl'"<A, B>(f: (b: B, a: A) => B, b: B, fa: NonEmptyBox<A>): B
    foldr1<A>(f: (a: A, b: A) => A, fa: NonEmptyBox<A>): A
    foldl1<A>(f: (a: A, b: A) => A, fa: NonEmptyBox<A>): A
    toList<A>(fa: NonEmptyBox<A>): ListBox<A>
    null<A>(fa: NonEmptyBox<A>): boolean
    length<A>(fa: NonEmptyBox<A>): number
    elem<A>(a: A, fa: NonEmptyBox<A>): boolean
    maximum(fa: NonEmptyBox<number>): number
    sum(fa: NonEmptyBox<number>): number
    product(fa: NonEmptyBox<number>): number
}

const base: FoldableBase = {
    foldr: <A, B>(f: (a: A, b: B) => B, b: B, fa: NonEmptyBox<A>): B => {
        const go = (lst: ListBox<A>): B => {
            if ($null(lst)) {
                return b
            }
            return f(listHead(lst), go(listTail(lst)))
        }
        return f(head(fa), go(tail(fa)))
    },
}

export const foldable = createFoldable(base) as NonEmptyFoldable<unknown>
