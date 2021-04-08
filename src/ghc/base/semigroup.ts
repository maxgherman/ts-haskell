import { Kind, MinBox0 } from "../../data/kind.ts";
import { head, NonEmpty, tail } from "./non-empty/list.ts";
import { head as listHead, List, tail as listTail } from "./list/list.ts";
import { $case, _ } from "./list/patterns.ts";

export type SemigroupBase<T> = {
  // (<>) :: a -> a -> a
  "<>"(a: MinBox0<T>, b: MinBox0<T>): MinBox0<T>;
};

export type Extensions<T> = {
  // sconcat :: NonEmpty a -> a
  sconcat(value: NonEmpty<MinBox0<T>>): MinBox0<T>;

  // stimes :: Integral b => b -> a -> a
  stimes(b: number, a: MinBox0<T>): MinBox0<T>;
};

export type Semigroup<T> = SemigroupBase<T> & Extensions<T> & {
  kind: (_: "*") => "Constraint";
};

export const kindOf = (_: Semigroup<unknown>): Kind => (_: "*") => "Constraint";

export const extensions = <T>(base: SemigroupBase<T>): Extensions<T> => ({
  sconcat(value: NonEmpty<MinBox0<T>>): MinBox0<T> {
    const go = (b: MinBox0<T>, value: List<MinBox0<T>>): MinBox0<T> =>
      $case([
        [[], () => b],
        [
          [_],
          (head, tail) =>
            tail
              ? base["<>"](b, go(head, tail))
              : base["<>"](b, go(listHead(head), listTail(head))),
        ],
      ])(value);

    return go(head(value), tail(value));
  },

  stimes(b: number, a: MinBox0<T>): MinBox0<T> {
    if (b < 0) {
      throw new Error("Exception: stimes, negative multiplier");
    }

    if (b == 0) {
      return a;
    }

    return new Array(b).fill(a)
      .reduce((acc, curr) => base["<>"](curr, acc));
  },
});

export const semigroup = <T>(
  base: SemigroupBase<T>,
  overrides?: Partial<Extensions<T>>,
): Semigroup<T> => ({
  ...base,
  ...extensions(base),
  ...overrides || {},
  kind: (_: "*") => "Constraint",
});
