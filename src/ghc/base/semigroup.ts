import { MinBox0 } from "../../data/kind.ts";
import { head, NonEmpty, tail } from "./non-empty/list.ts";
import { List } from "./list/list.ts";
import { $case, _ } from "./list/patterns.ts";

export type SemigroupBase = {
  "<>"<A>(a: MinBox0<A>, b: MinBox0<A>): MinBox0<A>;
};

export type Extensions = {
  sconcat<A>(value: NonEmpty<MinBox0<A>>): MinBox0<A>;
  stimes<A>(b: number, a: MinBox0<A>): MinBox0<A>;
};

export type Semigroup = SemigroupBase & Extensions;

const extensions = (base: SemigroupBase): Extensions => ({
  sconcat<A>(value: NonEmpty<MinBox0<A>>): MinBox0<A> {
    const go = <A>(b: MinBox0<A>, value: List<MinBox0<A>>): MinBox0<A> => {
      return $case([
        [[], () => b],
        [[_], (c, cs) => base["<>"](b, go<A>(c, cs))],
      ])(value);
    };

    return go(head(value), tail(value));
  },

  stimes<A>(b: number, a: MinBox0<A>): MinBox0<A> {
    if (b < 0) {
      throw new Error("Exception: stimes, negative multiplier");
    }

    if (b == 0) {
      return a;
    }

    return new Array(b).fill(a)
      .reduce((acc, curr) => base["<>"]<A>(curr, acc));
  },
});

export const semigroup = (base: SemigroupBase): Semigroup => ({
  ...base,
  ...extensions(base),
});
