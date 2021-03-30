import { MinBox0 } from "../../../data/kind.ts";
import {
  Semigroup,
  semigroup as createSemigroup,
  SemigroupBase,
} from "../semigroup.ts";
import { fst, snd, tuple2, Tuple2Box } from "./tuple.ts";
import { NonEmpty } from "../non-empty/list.ts";

export type TupleMinBox<T1, T2> = Tuple2Box<MinBox0<T1>, MinBox0<T2>>;
export interface Tuple2Semigroup<
  T1 extends Semigroup<T1>,
  T2 extends Semigroup<T2>,
> extends Semigroup<TupleMinBox<T1, T2>> {
  "<>"(
    a: TupleMinBox<T1, T2>,
    b: TupleMinBox<T1, T2>,
  ): TupleMinBox<T1, T2>;

  sconcat(value: NonEmpty<TupleMinBox<T1, T2>>): TupleMinBox<T1, T2>;
  stimes(b: number, a: TupleMinBox<T1, T2>): TupleMinBox<T1, T2>;
}

const base = <T1 extends Semigroup<T1>, T2 extends Semigroup<T2>>(
  innerSemigroup1: T1,
  innerSemigroup2: T2,
): SemigroupBase<TupleMinBox<T1, T2>> => ({
  "<>"(
    a: TupleMinBox<T1, T2>,
    b: TupleMinBox<T1, T2>,
  ): TupleMinBox<T1, T2> {
    const a1 = fst(a);
    const a2 = snd(a);
    const b1 = fst(b);
    const b2 = snd(b);

    return tuple2(innerSemigroup1["<>"](a1, b1), innerSemigroup2["<>"](a2, b2));
  },
});

export const semigroup = <T1 extends Semigroup<T1>, T2 extends Semigroup<T2>>(
  innerSemigroup1: T1,
  innerSemigroup2: T2,
) =>
  createSemigroup(base(innerSemigroup1, innerSemigroup2)) as Tuple2Semigroup<
    T1,
    T2
  >;
