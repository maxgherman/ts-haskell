import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose, id } from "../../../src/ghc/base/functions.ts";
import { semigroup as createSemigroup } from "../../../src/ghc/base/maybe/maybe-semigroup.ts";
import { $case, just, nothing } from "../../../src/ghc/base/maybe/maybe.ts";
import {
  ListSemigroup,
  semigroup as createListSemigroup,
} from "../../../src/ghc/base/list/list-semigroup.ts";
import {
  cons,
  ListBox,
  nil,
  toArray,
} from "../../../src/ghc/base/list/list.ts";
import { formList } from "../../../src/ghc/base/non-empty/list.ts";

const { asserts: { assertEquals, assertThrows } } = Rhum;

const listSemigroup = createListSemigroup<string>();
const semigroup = createSemigroup<ListSemigroup<string>>(listSemigroup);

const caseNothing = $case<ListBox<string>, string>({
  nothing: () => "nothing",
});

const caseArray = $case<ListBox<string>, string>({
  just: compose((x: string[]) => x.join(""), toArray),
});

const createList = (value: string) =>
  value.split("").reduceRight((acc, curr) => cons(curr)(acc), nil<string>());

Rhum.testSuite("MaybeSemigroup", () => {
  Rhum.testCase("<>", () => {
    const list = compose(cons("1"), cons("2"))(nil());
    const result1 = semigroup["<>"](nothing(), nothing());
    const result2 = semigroup["<>"](nothing(), just(list));
    const result3 = semigroup["<>"](just(list), nothing());
    const result4 = semigroup["<>"](just(list), just(list));

    assertEquals(caseNothing(result1), "nothing");
    assertEquals(caseArray(result2), "12");
    assertEquals(caseArray(result3), "12");
    assertEquals(caseArray(result4), "1212");
  });

  Rhum.testCase("sconcat", () => {
    const value1 = compose(formList, cons(nothing()), nil)(id);
    const value2 = compose(formList, cons(nothing()), cons(nothing()), nil)(id);

    const value3 = compose(
      formList,
      cons(just(createList("Hello"))),
      cons(just(createList(" "))),
      cons(just(createList("world"))),
      nil,
    )(id);

    const value4 = compose(
      formList,
      cons(nothing()),
      cons(just(createList("Hello"))),
      cons(nothing()),
      cons(just(createList(" world"))),
      cons(nothing()),
      nil,
    )(id);

    const result1 = semigroup.sconcat(value1);
    const result2 = semigroup.sconcat(value2);
    const result3 = semigroup.sconcat(value3);
    const result4 = semigroup.sconcat(value4);

    assertEquals(caseNothing(result1), "nothing");
    assertEquals(caseNothing(result2), "nothing");
    assertEquals(caseArray(result3), "Hello world");
    assertEquals(caseArray(result4), "Hello world");
  });

  Rhum.testCase("stimes", () => {
    const result1 = semigroup.stimes(10, nothing());
    const result2 = semigroup.stimes(3, just(createList("test ")));
    const result3 = () => semigroup.stimes(-1, just(createList("test")));

    assertEquals(caseNothing(result1), "nothing");
    assertEquals(caseArray(result2), "test test test ");
    assertThrows(result3);
  });

  Rhum.testSuite("semigroup law: (x <> y) <> z = x <> (y <> z)", () => {
    const list1 = just(createList("Hello "));
    const list2 = just(createList("world "));
    const list3 = just(createList("!!!"));

    const result1 = semigroup["<>"](semigroup["<>"](list1, list2), list3);
    const result2 = semigroup["<>"](list1, semigroup["<>"](list2, list3));

    assertEquals(caseArray(result1), caseArray(result2));
    assertEquals(caseArray(result1), "Hello world !!!");
  });
});

Rhum.run();
