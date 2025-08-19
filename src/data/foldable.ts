import { MinBox1, MinBox0, Kind, Constraint } from 'data/kind'
import { Monoid } from 'ghc/base/monoid'
import { ListBox, cons, nil, toArray as listToArray } from 'ghc/base/list/list'

export type FoldableBase = {
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: MinBox1<A>): B
}

export type Foldable = FoldableBase & {
    foldMap<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: MinBox1<A>): MinBox0<M>
    "foldMap'"<A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: MinBox1<A>): MinBox0<M>
    fold<M>(m: Monoid<M>, fa: MinBox1<M>): MinBox0<M>
    foldr<A, B>(f: (a: A, b: B) => B, b: B, fa: MinBox1<A>): B
    "foldr'"<A, B>(f: (a: A, b: B) => B, b: B, fa: MinBox1<A>): B
    foldl<A, B>(f: (b: B, a: A) => B, b: B, fa: MinBox1<A>): B
    "foldl'"<A, B>(f: (b: B, a: A) => B, b: B, fa: MinBox1<A>): B
    foldr1<A>(f: (a: A, b: A) => A, fa: MinBox1<A>): A
    foldl1<A>(f: (a: A, b: A) => A, fa: MinBox1<A>): A
    toList<A>(fa: MinBox1<A>): ListBox<A>
    null<A>(fa: MinBox1<A>): boolean
    length<A>(fa: MinBox1<A>): number
    elem<A>(a: A, fa: MinBox1<A>): boolean
    maximum(fa: MinBox1<number>): number
    sum(fa: MinBox1<number>): number
    product(fa: MinBox1<number>): number
    kind: (_: (_: '*') => '*') => Constraint
}

export const kindOf =
    (_: Foldable): Kind =>
    (_: (_: '*') => '*') =>
        'Constraint' as Constraint

export const foldable = (base: FoldableBase): Foldable => {
    const toList = <A>(fa: MinBox1<A>): ListBox<A> => base.foldr<A, ListBox<A>>((a, b) => cons(a)(b), nil(), fa)

    const toArray = <A>(fa: MinBox1<A>): A[] => listToArray(toList(fa))

    const foldl = <A, B>(f: (b: B, a: A) => B, b: B, fa: MinBox1<A>): B => toArray(fa).reduce((acc, x) => f(acc, x), b)

    const foldMap = <A, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, fa: MinBox1<A>): MinBox0<M> =>
        foldl<A, MinBox0<M>>((acc, x) => m['<>'](acc, f(x)), m.mempty, fa)

    const foldr1 = <A>(f: (a: A, b: A) => A, fa: MinBox1<A>): A => {
        const arr = toArray(fa)
        if (arr.length === 0) {
            throw new Error('foldr1: empty structure')
        }
        return arr.reduceRight((acc, x) => f(x, acc))
    }

    const foldl1 = <A>(f: (a: A, b: A) => A, fa: MinBox1<A>): A => {
        const arr = toArray(fa)
        if (arr.length === 0) {
            throw new Error('foldl1: empty structure')
        }
        return arr.reduce((acc, x) => f(acc, x))
    }

    const null_ = <A>(fa: MinBox1<A>): boolean => toArray(fa).length === 0
    const length = <A>(fa: MinBox1<A>): number => toArray(fa).length
    const elem = <A>(a: A, fa: MinBox1<A>): boolean => toArray(fa).some((x) => x === a)
    const maximum = (fa: MinBox1<number>): number => {
        const arr = toArray(fa)
        if (arr.length === 0) {
            throw new Error('maximum: empty structure')
        }
        return arr.reduce((acc, x) => (x > acc ? x : acc))
    }
    const sum = (fa: MinBox1<number>): number => foldl((acc, x) => acc + x, 0, fa)
    const product = (fa: MinBox1<number>): number => foldl((acc, x) => acc * x, 1, fa)

    return {
        ...base,
        foldMap,
        "foldMap'": foldMap,
        fold: <M>(m: Monoid<M>, fa: MinBox1<M>) => foldMap<M, M>(m, (x) => x, fa),
        foldr: base.foldr,
        "foldr'": base.foldr,
        foldl,
        "foldl'": foldl,
        foldr1,
        foldl1,
        toList,
        null: null_,
        length,
        elem,
        maximum,
        sum,
        product,
        kind: kindOf(null as unknown as Foldable) as (_: (_: '*') => '*') => 'Constraint',
    }
}
