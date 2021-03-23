import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose } from "../../../src/ghc/base/functions.ts";
import { semigroup } from "../../../src/ghc/base/tuple/unit-semigroup.ts";
import { unit } from "../../../src/ghc/base/tuple/tuple.ts";
import { formList } from "../../../src/ghc/base/non-empty/list.ts";
import { cons, nil } from "../../../src/ghc/base/list/list.ts";

const { asserts: { assertEquals, assertThrows } } = Rhum;

Rhum.testSuite("UnitSemigroup", () => {
  Rhum.testCase("<>", () => {
    const result = semigroup["<>"](unit(), unit());
    assertEquals(result, []);
  });

  Rhum.testCase("sconcat", () => {
    const data1 = compose(formList, cons(unit()), cons(unit()))(nil());
    const data2 = compose(formList, cons(unit()))(nil());
    const result1 = semigroup.sconcat(data1);
    const result2 = semigroup.sconcat(data2);

    assertEquals(result1, []);
    assertEquals(result2, []);
  });

  Rhum.testCase("stimes", () => {
    const result1 = semigroup.stimes(10, unit());
    const result2 = semigroup.stimes(0, unit());
    const result3 = () => semigroup.stimes(-1, unit());

    assertEquals(result1, []);
    assertEquals(result2, []);
    assertThrows(result3);
  });

  Rhum.testSuite("semigroup law: (x <> y) <> z = x <> (y <> z)", () => {
    const result1 = semigroup["<>"](semigroup["<>"](unit(), unit()), unit());
    const result2 = semigroup["<>"](unit(), semigroup["<>"](unit(), unit()));

    assertEquals(result1, result2);
    assertEquals(result1, []);
  });
});
