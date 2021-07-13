import { MinBox0 } from "data/kind.ts";
import {
  Semigroup,
  semigroup as createSemigroup,
  SemigroupBase,
} from "ghc/base/semigroup.ts";
import { NonEmpty } from "ghc/base/non-empty/list.ts";
import { FunctionArrowBox } from "ghc/prim/function-arrow/function-arrow.ts";

export type FunctionArrowMinBox<A, B> = FunctionArrowBox<A, MinBox0<B>>;

export interface FunctionArrowSemigroup<A, B extends Semigroup<B>>
  extends Semigroup<FunctionArrowMinBox<A, B>> {
  "<>"(
    a: FunctionArrowMinBox<A, B>,
    b: FunctionArrowMinBox<A, B>,
  ): FunctionArrowMinBox<A, B>;
  sconcat(
    value: NonEmpty<FunctionArrowMinBox<A, B>>,
  ): FunctionArrowMinBox<A, B>;
  stimes(b: number, a: FunctionArrowMinBox<A, B>): FunctionArrowMinBox<A, B>;
}

const base = <A, B>(
  innerSemigroup: Semigroup<B>,
): SemigroupBase<FunctionArrowMinBox<A, B>> => ({
  "<>": (
    a: FunctionArrowMinBox<A, B>,
    b: FunctionArrowMinBox<A, B>,
  ): FunctionArrowMinBox<A, B> =>
    ((x: A) => innerSemigroup["<>"](a(x), b(x))) as FunctionArrowMinBox<A, B>,
});

export const semigroup = <A, B extends Semigroup<B>>(
  innerSemigroup: Semigroup<B>,
) =>
  createSemigroup(base<A, B>(innerSemigroup)) as FunctionArrowSemigroup<
    A,
    Semigroup<B>
  >;
