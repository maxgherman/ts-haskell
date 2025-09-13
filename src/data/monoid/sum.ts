import { Box1, Type } from 'data/kind'
import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'

export type SumBox = Box1<number> & { readonly value: NonNullable<number> }

export const sum = (n: NonNullable<number>): SumBox => ({
    value: n,
    kind: (_: '*') => '*' as Type,
})

export const getSum = (s: SumBox): number => s.value

const baseSemigroup: SemigroupBase<SumBox> = {
    '<>': (a: SumBox, b: SumBox): SumBox => sum(a.value + b.value),
}

export const semigroup = () => createSemigroup(baseSemigroup) as Semigroup<SumBox>

export const monoid = () => createMonoid({ ...(semigroup() as MonoidBase<SumBox>), mempty: sum(0) }) as Monoid<SumBox>
