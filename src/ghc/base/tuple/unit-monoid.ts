import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'
import { semigroup } from './unit-semigroup'
import { unit, UnitBox } from './tuple'
import type { List } from 'ghc/base/list/list'

export interface UnitMonoid extends Monoid<UnitBox> {
    readonly mempty: UnitBox
    '<>'(a: UnitBox, b: UnitBox): UnitBox
    mappend(a: UnitBox, b: UnitBox): UnitBox
    mconcat: (_: List<UnitBox>) => UnitBox
}

const base: MonoidBase<UnitBox> = {
    ...semigroup,
    mempty: unit(),
}

export const monoid = createMonoid(base) as UnitMonoid
