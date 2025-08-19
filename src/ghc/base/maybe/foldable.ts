import { $case, MaybeBox, nothing } from './maybe'
import { FoldableBase, Foldable, foldable as createFoldable } from 'data/foldable'
import { Monoid } from 'ghc/base/monoid'
import { ListBox } from 'ghc/base/list/list'
import { MinBox0 } from 'data/kind'

export interface MaybeFoldable extends Foldable {
    foldMap<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: MaybeBox<A>): MinBox0<M>
    "foldMap'"<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: MaybeBox<A>): MinBox0<M>
    fold<M>(m: Monoid<M>, fa: MaybeBox<M>): MinBox0<M>
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: MaybeBox<A>): B
    "foldr'"<A, B>(f: (a: A, b: B) => B, b: B, fa: MaybeBox<A>): B
    foldl<A, B>(f: (b: B, a: A) => B, b: B, fa: MaybeBox<A>): B
    "foldl'"<A, B>(f: (b: B, a: A) => B, b: B, fa: MaybeBox<A>): B
    foldr1<A>(f: (a: A, b: A) => A, fa: MaybeBox<A>): A
    foldl1<A>(f: (a: A, b: A) => A, fa: MaybeBox<A>): A
    toList<A>(fa: MaybeBox<A>): ListBox<A>
    null<A>(fa: MaybeBox<A>): boolean
    length<A>(fa: MaybeBox<A>): number
    elem<A>(a: A, fa: MaybeBox<A>): boolean
    maximum(fa: MaybeBox<number>): number
    sum(fa: MaybeBox<number>): number
    product(fa: MaybeBox<number>): number
}

const base: FoldableBase = {
    foldr: <A, B>(f: (a: A, b: B) => B, b: B, fa: MaybeBox<A>): B =>
        $case<A, B>({
            nothing: () => b,
            just: (x: A) => f(x, b),
        })(fa),
}

export const foldable = createFoldable(base) as MaybeFoldable
