import {
  Semigroup,
  semigroup as createSemigroup,
  SemigroupBase,
} from "../semigroup.ts";
import { unit, UnitBox } from "./tuple.ts";
import { NonEmpty } from "../non-empty/list.ts";

export interface UnitSemigroup extends Semigroup<UnitBox> {
  "<>"(a: UnitBox, b: UnitBox): UnitBox;
  sconcat(value: NonEmpty<UnitBox>): UnitBox;
  stimes(b: number, a: UnitBox): UnitBox;
}

const base: SemigroupBase<UnitBox> = {
  "<>": (_a: UnitBox, _b: UnitBox): UnitBox => unit(),
};

export const semigroup = createSemigroup(base) as UnitSemigroup;
