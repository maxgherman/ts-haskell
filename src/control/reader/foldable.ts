import { ReaderBox } from './reader'
import { FoldableBase, Foldable, foldable as createFoldable } from 'data/foldable'
import { Monoid } from 'ghc/base/monoid'
import { ListBox } from 'ghc/base/list/list'
import { MinBox0 } from 'data/kind'

export interface ReaderFoldable<R> extends Foldable {
    foldMap<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: ReaderBox<R, A>): MinBox0<M>
    "foldMap'"<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: ReaderBox<R, A>): MinBox0<M>
    fold<M>(m: Monoid<M>, fa: ReaderBox<R, M>): MinBox0<M>
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: ReaderBox<R, A>): B
    "foldr'"<A, B>(f: (a: A, b: B) => B, b: B, fa: ReaderBox<R, A>): B
    foldl<A, B>(f: (b: B, a: A) => B, b: B, fa: ReaderBox<R, A>): B
    "foldl'"<A, B>(f: (b: B, a: A) => B, b: B, fa: ReaderBox<R, A>): B
    foldr1<A>(f: (a: A, b: A) => A, fa: ReaderBox<R, A>): A
    foldl1<A>(f: (a: A, b: A) => A, fa: ReaderBox<R, A>): A
    toList<A>(fa: ReaderBox<R, A>): ListBox<A>
    null<A>(fa: ReaderBox<R, A>): boolean
    length<A>(fa: ReaderBox<R, A>): number
    elem<A>(a: A, fa: ReaderBox<R, A>): boolean
    maximum(fa: ReaderBox<R, number>): number
    sum(fa: ReaderBox<R, number>): number
    product(fa: ReaderBox<R, number>): number
}

const base = <R>(): FoldableBase => ({
    foldr: <A, B>(f: (a: A, b: B) => B, b: B, fa: ReaderBox<R, A>): B => f(fa.runReader(undefined as R), b),
})

export const foldable = <R>() => createFoldable(base<R>()) as ReaderFoldable<R>
