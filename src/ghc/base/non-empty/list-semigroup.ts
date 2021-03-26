import { compose } from "../functions.ts";
import {
  Semigroup,
  semigroup as createSemigroup,
  SemigroupBase,
} from "../semigroup.ts";
import { formList, head, NonEmpty, NonEmptyBox, tail } from "./list.ts";
import { concat, cons, ListBox } from "../list/list.ts";

export interface NonEmptySemigroup<T> extends Semigroup<NonEmptyBox<T>> {
  "<>"(a: NonEmptyBox<T>, b: NonEmptyBox<T>): NonEmptyBox<T>;
  sconcat(value: NonEmpty<NonEmptyBox<T>>): NonEmptyBox<T>;
  stimes(b: number, a: NonEmptyBox<T>): NonEmptyBox<T>;
}

const base = <T>(): SemigroupBase<NonEmptyBox<T>> => ({
  "<>"(a: NonEmptyBox<T>, b: NonEmptyBox<T>): NonEmptyBox<T> {
    const headA = head(a);
    const headB = head(b);
    const tailA = tail(a);
    const tailB = tail(b);

    return compose(
      formList,
      cons(headA),
      (x: ListBox<T>) => concat(tailA, x),
      cons(headB),
    )(tailB);
  },
});

export const semigroup = <T>() =>
  createSemigroup(base<T>()) as NonEmptySemigroup<T>;
