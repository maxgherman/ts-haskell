import { Box1, Type } from "../../../data/kind.ts";
import { compose, Slack } from "../functions.ts";
import { fst, snd } from "../tuple/tuple.ts";
import {
  cons,
  head as listHead,
  List,
  ListBox,
  map as listMap,
  tail as listTail,
} from "../list/list.ts";
import { $case as listCase, _ as __, Case } from "../list/patterns.ts";
import { just, MaybeBox, nothing } from "../maybe/maybe.ts";

export type NonEmpty<T> = Slack<[NonNullable<T>, List<T>]>;

export type NonEmptyBox<T> = Box1<T> & NonEmpty<T>;

export const nonEmpty = <T>(list: List<T>): MaybeBox<NonEmptyBox<T>> =>
  listCase<T, MaybeBox<NonEmptyBox<T>>>([
    [[], () => nothing<MaybeBox<NonEmptyBox<T>>>()],
    [
      [__],
      (head, tail) => {
        const result = () =>
          tail ? [head, tail] : [listHead(head), listTail(head)];
        result.kind = (_: "*") => "*" as Type;
        return just(result);
      },
    ],
  ])(list);

export const head = <T>(nonEmp: NonEmpty<T>): T => fst(nonEmp());

export const tail = <T>(nonEmp: NonEmpty<T>): ListBox<T> =>
  snd(nonEmp()) as ListBox<T>;

export const formList = <T>(list: List<T>): NonEmptyBox<T> =>
  listCase<T, NonEmptyBox<T>>([
    [[], () => {
      throw new Error("NonEmpty.fromList: empty list");
    }],
    [
      [__],
      (head, tail) => {
        const result = () =>
          tail ? [head, tail] : [listHead(head), listTail(head)];
        result.kind = (_: "*") => "*" as Type;
        return result as NonEmptyBox<T>;
      },
    ],
  ])(list);

export const toList = <T>(nonEmp: NonEmpty<T>): ListBox<T> =>
  compose<NonEmpty<T>, [NonNullable<T>, List<T>], ListBox<T>>(
    (source) => cons(fst(source))(snd(source)),
    (value: NonEmpty<T>) => value(),
  )(nonEmp);

export const map = <T1, T2>(
  f: (_: T1) => NonNullable<T2>,
  nonEmp: NonEmpty<T1>,
): NonEmptyBox<T2> =>
  compose<NonEmpty<T1>, [NonNullable<T1>, List<T1>], NonEmptyBox<T2>>(
    (source) => {
      const result = () => ([f(fst(source)), listMap(f, snd(source))]);
      result.kind = (_: "*") => "*" as Type;
      return result as NonEmptyBox<T2>;
    },
    (value: NonEmpty<T1>) => value(),
  )(nonEmp);

export const _ = __;

export const $case = <T, K>(caseOf: Case<K>) =>
  (nonEmptyList: NonEmpty<T>): K =>
    compose(listCase(caseOf), toList)(nonEmptyList);
