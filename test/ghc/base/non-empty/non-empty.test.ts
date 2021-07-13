import { Rhum } from "rhum/mod.ts";
import { compose, Func } from "ghc/base/functions.ts";
import {
  $null,
  cons,
  head as listHead,
  nil,
  tail as listTail,
  toArray,
} from "ghc/base/list/list.ts";
import {
  $case,
  _,
  formList,
  head,
  map,
  NonEmpty,
  nonEmpty,
  tail,
  toList,
} from "ghc/base/non-empty/list.ts";

const { asserts: { assertEquals, assert, assertThrows } } = Rhum;

Rhum.testSuite("NonEmpty", () => {
  Rhum.testCase("nonEmpty", () => {
    const value0 = compose(nonEmpty)(nil<number>());
    const value1 = compose(nonEmpty, cons(1))(nil<number>());
    const value2 = compose(nonEmpty, cons(1), cons(2))(nil<number>());
    const value3 = compose(nonEmpty, cons(1), cons(2), cons(3))(nil<number>());

    assertEquals(value0(), undefined);

    assertEquals(((value1() as Func)() as never[])[0], 1);
    assert($null(((value1() as Func)() as never[])[1]));

    assertEquals(((value2() as Func)() as never[])[0], 1);
    assertEquals(listHead(((value2() as Func)() as never[])[1]), 2);

    assertEquals(((value3() as Func)() as never[])[0], 1);
    assertEquals(listHead(((value3() as Func)() as never[])[1]), 2);
    assertEquals(listHead(listTail(((value3() as Func)() as never[])[1])), 3);
  });

  Rhum.testCase("head", () => {
    const list: NonEmpty<number> = () => [1, nil<number>()];
    const result = head(list);

    assertEquals(result, 1);
  });

  Rhum.testCase("tail", () => {
    const list1: NonEmpty<number> = () => [1, nil<number>()];
    const list2: NonEmpty<number> = () => [1, cons(3)(nil<number>())];

    const result1 = tail(list1);
    const result2 = tail(list2);

    assertEquals(toArray(result1), []);
    assertEquals(toArray(result2), [3]);
  });

  Rhum.testCase("fromList", () => {
    const list1 = nil<number>();
    const list2 = cons(2)(cons(3)(nil<number>()));

    const result2 = formList(list2);

    assertThrows(() => formList(list1));
    assertEquals(((result2 as Func)() as never[])[0], 2);
    assertEquals(listHead(((result2 as Func)() as never[])[1]), 3);
    assert($null(listTail(((result2 as Func)() as never[])[1])));
  });

  Rhum.testCase("toListList", () => {
    const list: NonEmpty<number> =
      () => [0, compose(cons(1), cons(2), cons(3))(nil<number>())];

    const result = toList(list);

    assertEquals(toArray(result), [0, 1, 2, 3]);
  });

  Rhum.testCase("map", () => {
    const list: NonEmpty<number> =
      () => [0, compose(cons(1), cons(2), cons(3))(nil<number>())];

    const result = map((x) => x + 1, list);

    assertEquals(toArray(toList(result)), [1, 2, 3, 4]);
  });

  Rhum.testCase("$case", () => {
    const value1 = compose(formList, cons(1))(nil<number>());
    const value2 = compose(formList, cons(1), cons(2))(nil<number>());
    const value3 = compose(formList, cons(1), cons(2), cons(3))(nil<number>());

    const result0 = $case([
      [[], () => {
        console.log("No match");
      }],
    ]);

    const result1 = $case([
      [[], () => {
        throw new Error();
      }],
      [[_], (a) => a + 1],
    ])(value1);

    const result2 = $case([
      [[], () => {
        throw new Error();
      }],
      [[_, _], (a, b) => a + b + 1],
      [[_], (a) => a + 1],
    ])(value2);

    const result3 = $case([
      [[], () => {
        throw new Error();
      }],
      [[_, _, _], (a, b, c) => a + b + c + 1],
      [[_, _], (a, b) => a + b + 1],
      [[_], (a) => a + 1],
    ])(value3);

    assertThrows(() => result0(value1));
    assertEquals(result1, 2);
    assertEquals(result2, 4);
    assertEquals(result3, 7);
  });

  Rhum.testCase("$case rest", () => {
    const empty = nil<number>();
    const value = compose(cons(4), cons(3), cons(2), cons(1))(empty);

    const result1 = $case([
      [[_], (a) => listHead(a)],
    ])(formList(value));

    const result2 = $case([
      [[_, _], (a, b) => `${a} ${listHead(b)}`],
    ])(formList(value));

    const result3 = $case([
      [[_, _, _], (a, b, c) => `${a} ${b} ${listHead(c)}`],
    ])(formList(value));

    const result4 = $case([
      [[_, _, _, _], (a, b, c, d) => `${a} ${b} ${c} ${d}`],
    ])(formList(value));

    const result5 = $case([
      [[], (a) => a],
      [[_, _, _], (a, b) => `${a} - ${b}`],
    ])(formList(value));

    assertEquals(result1, 4);
    assertEquals(result2, "4 3");
    assertEquals(result3, "4 3 2");
    assertEquals(result4, "4 3 2 1");
    assertEquals(result5, "4 - 3");
  });
});

Rhum.run();
