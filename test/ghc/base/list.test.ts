import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose, id } from "../../../src/ghc/base/functions.ts";
import {
  $null,
  cons,
  head,
  map,
  nil,
  tail,
  toArray,
} from "../../../src/ghc/base/list/list.ts";
import { $case, _ } from "../../../src/ghc/base/list/patterns.ts";

const { asserts: { assertEquals, assert, assertThrows } } = Rhum;

Rhum.testSuite("List", () => {
  Rhum.testCase("Nil constructor", () => {
    const value = nil<number>();
    const result = value();

    assertEquals(result, []);
    assertEquals(toArray(value), []);
  });

  Rhum.testCase("Nil $null", () => {
    const value = nil<number>();

    assert($null(value));
  });

  Rhum.testCase("Nil $case", () => {
    const value = nil<string>();

    const result1 = $case([
      [[], () => 123],
    ])(value);

    const result2 = $case([
      [[], () => 123],
      [[], () => 123],
    ])(value);

    const result3 = $case([
      [[_], id],
      [[_, _], (a, b) => 1],
      [[], () => 123],
    ])(value);

    const result4 = $case([
      [[_], id],
      [[_, _], (a, b) => 1],
    ]);

    const result5 = $case([]);

    assertEquals(result1, 123);
    assertEquals(result2, 123);
    assertEquals(result3, 123);
    assertThrows(() => result4(value));
    assertThrows(() => result5(value));
  });

  Rhum.testCase("Nil head", () => {
    const value = nil<number>();

    assertThrows(() => head(value));
  });

  Rhum.testCase("Nil tail", () => {
    const value = nil<number>();

    assertThrows(() => tail(value));
  });

  Rhum.testCase("Nil map ", () => {
    const value = nil<number>();

    const result = map((x) => x + 1, value);

    assertEquals(toArray(result), []);
  });

  Rhum.testCase("Cons constructor", () => {
    const empty = nil<number>();
    const result1 = cons(3)(cons(2)(cons(1)(empty)));
    const result2 = compose(cons(3), cons(2), cons<number>(1))(empty);

    assertEquals(toArray(result1), [3, 2, 1]);
    assertEquals(toArray(result2), [3, 2, 1]);
  });

  Rhum.testCase("Cons $case", () => {
    const empty = nil<number>();
    const value1 = cons(1)(empty);
    const value2 = cons(2)(cons(1)(empty));
    const value3 = cons(3)(cons(2)(cons(1)(empty)));

    const result1 = $case([
      [[_, _], (a, b) => a + b],
      [[_, _, _], (a, b, c) => a + b + c],
      [[_], (a) => a + 10],
    ])(value1);

    const result2 = $case([
      [[], () => {}],
      [[_, _], (a, b) => a + b + 10],
    ])(value2);

    const result3 = $case([
      [[_, _, _], (a, b, c) => a + b + c],
      [[_], (a) => a + 10],
    ])(value3);

    assertEquals(result1, 1 + 10);
    assertEquals(result2, 2 + 1 + 10);
    assertEquals(result3, 3 + 2 + 1);
  });

  Rhum.testCase("Cons $case rest", () => {
    const empty = nil<number>();
    const value = compose(cons(4), cons(3), cons(2), cons(1))(empty);

    const result1 = $case([
      [[_], (a) => head(a)],
    ])(value);

    const result2 = $case([
      [[_, _], (a, b) => `${a} ${head(b)}`],
    ])(value);

    const result3 = $case([
      [[_, _, _], (a, b, c) => `${a} ${b} ${head(c)}`],
    ])(value);

    const result4 = $case([
      [[_, _, _, _], (a, b, c, d) => `${a} ${b} ${c} ${d}`],
    ])(value);

    const result5 = $case([
      [[], (a) => a],
      [[_, _, _], (a, b) => `${a} - ${b}`],
    ])(value);

    assertEquals(result1, 4);
    assertEquals(result2, "4 3");
    assertEquals(result3, "4 3 2");
    assertEquals(result4, "4 3 2 1");
    assertEquals(result5, "4 - 3");
  });

  Rhum.testCase("Cons $case rest exact", () => {
    const empty = nil<number>();
    const value1 = cons(1)(empty);
    const value2 = compose(cons(1), cons(2))(empty);
    const value3 = compose(cons(1), cons(2), cons(3))(empty);

    const result1 = $case([
      [[_], (a, b) => ({ a, b: $null(b) })],
    ])(value1);

    const result2 = $case([
      [[_, _], (a, b, c) => ({ a, b, c: $null(c) })],
    ])(value2);

    const result3 = $case([
      [[_, _, _], (a, b, c, d) => ({ a, b, c, d: $null(d) })],
    ])(value3);

    assertEquals(result1, { a: 1, b: true });
    assertEquals(result2, { a: 1, b: 2, c: true });
    assertEquals(result3, { a: 1, b: 2, c: 3, d: true });
  });

  Rhum.testCase("Cons head", () => {
    const value = compose(cons(2), cons(1))(nil<number>());
    assertEquals(head(value), 2);
  });

  Rhum.testCase("Cons tail", () => {
    const value = compose(cons(2), cons(1))(nil<number>());
    assertEquals(toArray(tail(value)), [1]);
  });

  Rhum.testCase("Cons map ", () => {
    const value = compose(cons(3), cons(2), cons(1))(nil<number>());

    const result = map((x) => x + 1, value);

    assertEquals(toArray(result), [4, 3, 2]);
  });
});

Rhum.run();
