import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose } from "../../../src/ghc/base/functions.ts";
import { semigroup as createSemigroup } from "../../../src/ghc/base/non-empty/list-semigroup.ts";
import {
  cons,
  formList,
  NonEmptyBox,
  toList,
} from "../../../src/ghc/base/non-empty/list.ts";
import {
  cons as listCons,
  ListBox,
  nil,
  toArray,
} from "../../../src/ghc/base/list/list.ts";

const { asserts: { assertEquals, assertThrows } } = Rhum;
const semigroup = createSemigroup<number>();

const createList = (value: number[]): ListBox<number> =>
  value.reduceRight((acc, curr) => listCons(curr)(acc), nil<number>());

const createNonEmptyList = (value: number[]): NonEmptyBox<number> =>
  compose<number[], ListBox<number>, NonEmptyBox<number>>(formList, createList)(
    value,
  );

Rhum.testSuite("NonEmptySemigroup", () => {
  Rhum.testCase("<>", () => {
    const result = semigroup["<>"](
      createNonEmptyList([1, 2, 3]),
      createNonEmptyList([4, 5, 6]),
    );

    assertEquals(toArray(toList(result)), [1, 2, 3, 4, 5, 6]);
  });

  Rhum.testCase("sconcat", () => {
    const lists = [[1, 1], [2, 2], [3, 3]].map(createNonEmptyList);

    const value = compose(
      cons(lists[0]),
      toList,
      cons(lists[1]),
      toList,
      cons(lists[2]),
    )(nil());

    const result = semigroup.sconcat(value);
    assertEquals(toArray(toList(result)), [1, 1, 2, 2, 3, 3]);
  });

  Rhum.testCase("stimes", () => {
    const list = createNonEmptyList([1, 2, 3]);

    const result1 = semigroup.stimes(3, list);
    const result2 = semigroup.stimes(0, list);
    const result3 = () => semigroup.stimes(-3, list);

    assertEquals(toArray(toList(result1)), [1, 2, 3, 1, 2, 3, 1, 2, 3]);
    assertEquals(toArray(toList(result2)), [1, 2, 3]);
    assertThrows(result3);
  });

  Rhum.testSuite("semigroup law: (x <> y) <> z = x <> (y <> z)", () => {
    const list1 = createNonEmptyList([1, 2, 3]);
    const list2 = createNonEmptyList([4, 5]);
    const list3 = createNonEmptyList([6]);

    const result3 = compose(
      (z: NonEmptyBox<number>) => semigroup["<>"](z, list3),
      (y: NonEmptyBox<number>) => semigroup["<>"](list1, y),
    )(list2);

    const result4 = compose(
      (z: NonEmptyBox<number>) => semigroup["<>"](list1, z),
      (y: NonEmptyBox<number>) => semigroup["<>"](list2, y),
    )(list3);

    assertEquals(toArray(toList(result3)), toArray(toList(result4)));
    assertEquals(toArray(toList(result3)), [1, 2, 3, 4, 5, 6]);
  });
});

Rhum.run();
