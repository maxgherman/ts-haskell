import { Box1, Type } from 'data/kind'
import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'

export type AllBox = Box1<boolean> & { readonly value: NonNullable<boolean> }

export const all = (b: NonNullable<boolean>): AllBox => ({
    value: b,
    kind: (_: '*') => '*' as Type,
})

export const getAll = (a: AllBox): boolean => a.value

const baseSemigroup: SemigroupBase<AllBox> = {
    '<>': (a: AllBox, b: AllBox): AllBox => all(a.value && b.value),
}

export const semigroup = () => createSemigroup(baseSemigroup) as Semigroup<AllBox>

export const monoid = () =>
    createMonoid({ ...(semigroup() as MonoidBase<AllBox>), mempty: all(true) }) as Monoid<AllBox>
