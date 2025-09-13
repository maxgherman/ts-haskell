import { Box1, Type } from 'data/kind'
import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'

export type ProductBox = Box1<number> & { readonly value: NonNullable<number> }

export const product = (n: NonNullable<number>): ProductBox => ({
    value: n,
    kind: (_: '*') => '*' as Type,
})

export const getProduct = (p: ProductBox): number => p.value

const baseSemigroup: SemigroupBase<ProductBox> = {
    '<>': (a: ProductBox, b: ProductBox): ProductBox => product(a.value * b.value),
}

export const semigroup = () => createSemigroup(baseSemigroup) as Semigroup<ProductBox>

export const monoid = () =>
    createMonoid({ ...(semigroup() as MonoidBase<ProductBox>), mempty: product(1) }) as Monoid<ProductBox>
