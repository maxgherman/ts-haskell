import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose } from "../../../src/ghc/base/functions.ts";
import { semigroup as createSemigroup } from "../../../src/ghc/base/list/list-semigroup.ts";
import {
  cons,
  ListBox,
  nil,
  toArray,
} from "../../../src/ghc/base/list/list.ts";
import { formList } from "../../../src/ghc/base/non-empty/list.ts";

const { asserts: { assertEquals, assert, assertThrows } } = Rhum;
const semigroup = createSemigroup<number>();

const createList = (value: number) => cons(value)(nil());

Rhum.testSuite("ListSemigroup", () => {
  Rhum.testCase("<>", () => {
    const result1 = semigroup["<>"](nil(), nil());
    const result2 = semigroup["<>"](nil(), cons(1)(cons(2)(nil())));
    const result3 = semigroup["<>"](cons(1)(cons(2)(nil())), nil());
    const result4 = semigroup["<>"](cons(1)(cons(2)(nil())), cons(3)(nil()));
    const result5 = semigroup["<>"](cons(3)(nil()), cons(1)(cons(2)(nil())));

    assertEquals(toArray(result1), []);
    assertEquals(toArray(result2), [1, 2]);
    assertEquals(toArray(result3), [1, 2]);
    assertEquals(toArray(result4), [1, 2, 3]);
    assertEquals(toArray(result5), [3, 1, 2]);
  });

  Rhum.testCase("sconcat", () => {
    const innerListHead = cons(createList(1))(nil());
    const innerListTail = compose(
      cons(createList(1)),
      cons(createList(2)),
      cons(createList(3)),
    )(
      nil(),
    );

    const data1 = formList(innerListHead);
    const data2 = formList(innerListTail);

    const result1 = semigroup.sconcat(data1);
    const result2 = semigroup.sconcat(data2);

    assertEquals(toArray(result1), [1]);
    assertEquals(toArray(result2), [1, 2, 3]);
  });

  Rhum.testCase("stimes", () => {
    const result1 = compose(
      (x: ListBox<number>) => semigroup.stimes(10, x),
      cons(1),
    )(nil());

    const result2 = compose(
      (x: ListBox<number>) => semigroup.stimes(0, x),
      cons(1),
      cons(2),
      cons(3),
    )(nil());

    const result3 = semigroup.stimes(20, nil());
    const result4 = () => semigroup.stimes(-1, nil());

    assertEquals(toArray(result1), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    assertEquals(toArray(result2), [1, 2, 3]);
    assertEquals(toArray(result3), []);
    assertThrows(result4);
  });

  Rhum.testSuite("semigroup law: (x <> y) <> z = x <> (y <> z)", () => {
    const empty = nil<number>();
    const list1 = compose(cons(1), cons(2), cons(3))(nil<number>());
    const list2 = compose(cons(4), cons(5))(nil<number>());
    const list3 = compose(cons(6))(nil<number>());

    const result1 = compose(
      (x: ListBox<number>) => semigroup["<>"](x, empty),
      (x: ListBox<number>) => semigroup["<>"](empty, x),
    )(empty);

    const result2 = compose(
      (x: ListBox<number>) => semigroup["<>"](empty, x),
      (x: ListBox<number>) => semigroup["<>"](empty, x),
    )(empty);

    const result3 = compose(
      (z: ListBox<number>) => semigroup["<>"](z, list3),
      (y: ListBox<number>) => semigroup["<>"](list1, y),
    )(list2);

    const result4 = compose(
      (z: ListBox<number>) => semigroup["<>"](list1, z),
      (y: ListBox<number>) => semigroup["<>"](list2, y),
    )(list3);

    assertEquals(toArray(result1), toArray(result2));
    assertEquals(toArray(result1), []);

    assertEquals(toArray(result3), toArray(result4));
    assertEquals(toArray(result3), [1, 2, 3, 4, 5, 6]);
  });
});
