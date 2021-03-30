import { MinBox0 } from "../../../data/kind.ts";
import {
  extensions,
  Semigroup,
  semigroup as createSemigroup,
  SemigroupBase,
} from "../semigroup.ts";
import { NonEmpty } from "../non-empty/list.ts";
import { $case, just, MaybeBox, nothing } from "./maybe.ts";
export interface MaybeSemigroup<T extends Semigroup<T>>
  extends Semigroup<MaybeBox<T>> {
  "<>"(a: MaybeBox<T>, b: MaybeBox<T>): MaybeBox<T>;
  sconcat(value: NonEmpty<MaybeBox<T>>): MaybeBox<T>;
  stimes(b: number, a: MaybeBox<T>): MaybeBox<T>;
}

const base = <T extends Semigroup<T>>(
  innerSemigroup: T,
): SemigroupBase<MaybeBox<T>> => ({
  "<>": (a: MaybeBox<T>, b: MaybeBox<T>): MaybeBox<T> =>
    $case({
      nothing: () => b,
      just: (x: T) =>
        $case({
          nothing: () => a,
          just: (y: T) => just(innerSemigroup["<>"](x, y)),
        })(b),
    })(a) as MaybeBox<T>,
});

const stimesMaybe = <T>(
  stimesBase: ((_: number, __: MinBox0<T>) => MinBox0<T>),
) =>
  (n: number, a: MaybeBox<T>) => {
    return $case({
      nothing: () => nothing(),
      just: () => {
        if (n < 0) {
          throw new Error("stimes: Maybe, negative multiplier");
        }

        return n === 0 ? nothing() : stimesBase(n, a);
      },
    })(a);
  };

export const semigroup = <T extends Semigroup<T>>(innerSemigroup: T) => {
  const _base = base<T>(innerSemigroup);
  const baseExtensions = extensions(_base);

  const overrides = {
    ...baseExtensions,
    stimes: stimesMaybe(baseExtensions.stimes),
  };

  return createSemigroup(_base, overrides) as MaybeSemigroup<T>;
};
