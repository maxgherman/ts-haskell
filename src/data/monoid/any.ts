import { Box1, Type } from 'data/kind'
import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'

export type AnyBox = Box1<boolean> & { readonly value: NonNullable<boolean> }

export const any = (b: NonNullable<boolean>): AnyBox => ({
    value: b,
    kind: (_: '*') => '*' as Type,
})

export const getAny = (a: AnyBox): boolean => a.value

const baseSemigroup: SemigroupBase<AnyBox> = {
    '<>': (a: AnyBox, b: AnyBox): AnyBox => any(a.value || b.value),
}

export const semigroup = () => createSemigroup(baseSemigroup) as Semigroup<AnyBox>

export const monoid = () =>
    createMonoid({ ...(semigroup() as MonoidBase<AnyBox>), mempty: any(false) }) as Monoid<AnyBox>
