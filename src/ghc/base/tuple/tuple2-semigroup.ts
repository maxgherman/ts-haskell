import { MinBox0 } from "../../../data/kind.ts";
import {
  Semigroup,
  semigroup as createSemigroup,
  SemigroupBase,
} from "../semigroup.ts";
import { fst, snd, tuple2, Tuple2Box } from "./tuple.ts";
import { NonEmpty } from "../non-empty/list.ts";

export type TupleMiniBox<T1, T2> = Tuple2Box<MinBox0<T1>, MinBox0<T2>>;

export interface Tuple2Semigroup<
  T1 extends Semigroup<T1>,
  T2 extends Semigroup<T2>,
> extends Semigroup<TupleMiniBox<T1, T2>> {
  "<>"(
    a: Tuple2Box<T1, T2>,
    b: Tuple2Box<T1, T2>,
  ): TupleMiniBox<T1, T2>;

  sconcat(value: NonEmpty<Tuple2Box<T1, T2>>): TupleMiniBox<T1, T2>;
  stimes(b: number, a: Tuple2Box<T1, T2>): TupleMiniBox<T1, T2>;
}

const base = <
  T1 extends Semigroup<T1>,
  T2 extends Semigroup<T2>,
>(): SemigroupBase<TupleMiniBox<T1, T2>> => ({
  "<>"(
    a: Tuple2Box<T1, T2>,
    b: Tuple2Box<T1, T2>,
  ): TupleMiniBox<T1, T2> {
    const a1 = fst(a);
    const a2 = snd(a);
    const b1 = fst(b);
    const b2 = snd(b);

    return tuple2(a1["<>"](a1, b1), b1["<>"](a2, b2));
  },
});

export const semigroup = <
  T1 extends Semigroup<T1>,
  T2 extends Semigroup<T2>,
>() => createSemigroup(base()) as Tuple2Semigroup<T1, T2>;
