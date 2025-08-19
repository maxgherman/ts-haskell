import { WriterBox } from './writer'
import { FoldableBase, Foldable, foldable as createFoldable } from 'data/foldable'
import { Monoid } from 'ghc/base/monoid'
import { ListBox } from 'ghc/base/list/list'

export interface WriterFoldable<W> extends Foldable {
    foldMap<A, M>(m: Monoid<M>, f: (a: A) => M, fa: WriterBox<W, A>): M
    "foldMap'"<A, M>(m: Monoid<M>, f: (a: A) => M, fa: WriterBox<W, A>): M
    fold<M>(m: Monoid<M>, fa: WriterBox<W, M>): M
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: WriterBox<W, A>): B
    "foldr'"<A, B>(f: (a: A, b: B) => B, b: B, fa: WriterBox<W, A>): B
    foldl<A, B>(f: (b: B, a: A) => B, b: B, fa: WriterBox<W, A>): B
    "foldl'"<A, B>(f: (b: B, a: A) => B, b: B, fa: WriterBox<W, A>): B
    foldr1<A>(f: (a: A, b: A) => A, fa: WriterBox<W, A>): A
    foldl1<A>(f: (a: A, b: A) => A, fa: WriterBox<W, A>): A
    toList<A>(fa: WriterBox<W, A>): ListBox<A>
    null<A>(fa: WriterBox<W, A>): boolean
    length<A>(fa: WriterBox<W, A>): number
    elem<A>(a: A, fa: WriterBox<W, A>): boolean
    maximum(fa: WriterBox<W, number>): number
    sum(fa: WriterBox<W, number>): number
    product(fa: WriterBox<W, number>): number
}

const base = <W>(): FoldableBase => ({
    foldr: <A, B>(f: (a: A, b: B) => B, b: B, fa: WriterBox<W, A>): B => {
        const [a] = fa.runWriter()
        return f(a, b)
    },
})

export const foldable = <W>() => createFoldable(base<W>()) as WriterFoldable<W>
