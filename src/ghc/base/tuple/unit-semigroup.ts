import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { unit, UnitBox } from './tuple'
import { NonEmpty } from 'ghc/base/non-empty/list'

export interface UnitSemigroup extends Semigroup<UnitBox> {
    '<>'(a: UnitBox, b: UnitBox): UnitBox
    sconcat(value: NonEmpty<UnitBox>): UnitBox
    stimes(b: number, a: UnitBox): UnitBox
}

const base: SemigroupBase<UnitBox> = {
    '<>': (_a: UnitBox, _b: UnitBox): UnitBox => unit(),
}

export const semigroup = createSemigroup(base) as UnitSemigroup
