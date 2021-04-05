import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose } from "../../../../src/ghc/base/functions.ts";
import { semigroup as createSemigroup } from "../../../../src/ghc/base/tuple/tuple2-semigroup.ts";
import {
  semigroup as createListSemigroup,
} from "../../../../src/ghc/base/list/list-semigroup.ts";
import { semigroup as createMaybeSemigroup } from "../../../../src/ghc/base/maybe/maybe-semigroup.ts";
import {
  $case as maybeCase,
  just,
  MaybeBox,
} from "../../../../src/ghc/base/maybe/maybe.ts";
import {
  cons,
  ListBox,
  nil,
  toArray,
} from "../../../../src/ghc/base/list/list.ts";
import { fst, snd, tuple2 } from "../../../../src/ghc/base/tuple/tuple.ts";
import { formList } from "../../../../src/ghc/base/non-empty/list.ts";

const { asserts: { assertEquals, assertThrows } } = Rhum;

const listSemigroup = createListSemigroup<number>();
const maybeSemigroup = createMaybeSemigroup(createListSemigroup<string>());
const semigroup = createSemigroup(
  listSemigroup,
  maybeSemigroup,
);

const caseArray = maybeCase<ListBox<string>, string>({
  just: compose((x: string[]) => x.join(""), toArray),
});

const createList = <T>(value: NonNullable<T>[]) =>
  value.reduceRight((acc, curr) => cons(curr)(acc), nil<T>());

Rhum.testSuite("Tuple2Semigroup", () => {
  Rhum.testCase("<>", () => {
    const list1 = createList([1, 2]);
    const list2 = createList(["3", "4"]);
    const list3 = createList([5, 6]);
    const list4 = createList(["7", "8"]);

    const value1 = tuple2(list1, just(list2));
    const value2 = tuple2(list3, just(list4));
    const result4 = semigroup["<>"](value1, value2);

    assertEquals(toArray(fst(result4) as ListBox<number>), [1, 2, 5, 6]);
    assertEquals(caseArray(snd(result4) as MaybeBox<ListBox<string>>), "3478");
  });

  Rhum.testCase("sconcat", () => {
    const list1 = createList([1, 2]);
    const list2 = createList(["3", "4"]);

    const value1 = tuple2(list1, just(list2));
    const value2 = tuple2(list1, just(list2));

    const value = compose(formList, cons(value1), cons(value2))(nil());
    const result = semigroup.sconcat(value);

    assertEquals(toArray(fst(result) as ListBox<number>), [1, 2, 1, 2]);
    assertEquals(caseArray(snd(result) as MaybeBox<ListBox<string>>), "3434");
  });

  Rhum.testCase("stimes", () => {
    const list1 = createList([1, 2]);
    const list2 = createList(["3", "4"]);

    const value = tuple2(list1, just(list2));
    const result = semigroup.stimes(3, value);
    const result2 = () => semigroup.stimes(-3, value);

    assertEquals(toArray(fst(result) as ListBox<number>), [1, 2, 1, 2, 1, 2]);
    assertEquals(caseArray(snd(result) as MaybeBox<ListBox<string>>), "343434");
    assertThrows(result2);
  });

  Rhum.testSuite("semigroup law: (x <> y) <> z = x <> (y <> z)", () => {
    const value1 = tuple2(createList([1, 2]), just(createList(["3", "4"])));
    const value2 = tuple2(createList([5, 6]), just(createList(["7"])));
    const value3 = tuple2(createList([8]), just(createList(["9"])));

    const result1 = semigroup["<>"](semigroup["<>"](value1, value2), value3);
    const result2 = semigroup["<>"](value1, semigroup["<>"](value2, value3));

    assertEquals(toArray(fst(result1) as ListBox<number>), [1, 2, 5, 6, 8]);
    assertEquals(caseArray(snd(result1) as MaybeBox<ListBox<string>>), "3479");
    assertEquals(toArray(fst(result2) as ListBox<number>), [1, 2, 5, 6, 8]);
    assertEquals(caseArray(snd(result2) as MaybeBox<ListBox<string>>), "3479");
  });
});

Rhum.run();
