import { $case, EitherBox } from './either'
import { FoldableBase, Foldable, foldable as createFoldable } from 'data/foldable'
import { Monoid } from 'ghc/base/monoid'
import { ListBox } from 'ghc/base/list/list'
import { MinBox0 } from 'data/kind'

export interface EitherFoldable<L> extends Foldable {
    foldMap<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: EitherBox<L, A>): MinBox0<M>
    "foldMap'"<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: EitherBox<L, A>): MinBox0<M>
    fold<M>(m: Monoid<M>, fa: EitherBox<L, M>): MinBox0<M>
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: EitherBox<L, A>): B
    "foldr'"<A, B>(f: (a: A, b: B) => B, b: B, fa: EitherBox<L, A>): B
    foldl<A, B>(f: (b: B, a: A) => B, b: B, fa: EitherBox<L, A>): B
    "foldl'"<A, B>(f: (b: B, a: A) => B, b: B, fa: EitherBox<L, A>): B
    foldr1<A>(f: (a: A, b: A) => A, fa: EitherBox<L, A>): A
    foldl1<A>(f: (a: A, b: A) => A, fa: EitherBox<L, A>): A
    toList<A>(fa: EitherBox<L, A>): ListBox<A>
    null<A>(fa: EitherBox<L, A>): boolean
    length<A>(fa: EitherBox<L, A>): number
    elem<A>(a: A, fa: EitherBox<L, A>): boolean
    maximum(fa: EitherBox<L, number>): number
    sum(fa: EitherBox<L, number>): number
    product(fa: EitherBox<L, number>): number
}

const base = <L>(): FoldableBase => ({
    foldr: <A, B>(f: (a: A, b: B) => B, b: B, fa: EitherBox<L, A>): B =>
        $case<L, A, B>({
            left: () => b,
            right: (x: A) => f(x, b),
        })(fa),
})

export const foldable = <L>() => createFoldable(base<L>()) as EitherFoldable<L>
