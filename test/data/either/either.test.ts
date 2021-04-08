import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { Func } from "../../../src/ghc/base/functions.ts";
import { $case, kindOf, left, right } from "../../../src/data/either/either.ts";

const { asserts: { assertEquals, assertThrows } } = Rhum;

Rhum.testSuite("Either", () => {
  Rhum.testCase("Left constructor", () => {
    const boxedValue = new Error();

    const value = left<Error, string>(boxedValue);
    const result = value();

    assertEquals(result, boxedValue);
  });

  Rhum.testCase("Left $case", () => {
    const boxedValue = new Error();

    const value = left<Error, string>(boxedValue);

    const result = $case({
      left: (x) => x,
      right: (_: string) => {},
    })(value);

    assertEquals(result, boxedValue);
  });

  Rhum.testCase("Left $case missing pattern", () => {
    const boxedValue = new Error();
    const value = left<Error, string>(boxedValue);

    const result = () =>
      $case({
        right: (_: string) => {},
      })(value);

    assertThrows(() => result());
  });

  Rhum.testCase("Right constructor", () => {
    const boxedValue = 123;

    const value = right<Error, number>(boxedValue);
    const result = value();

    assertEquals(result, boxedValue);
  });

  Rhum.testCase("Right $case", () => {
    const boxedValue = 123;

    const value = right<Error, number>(boxedValue);

    const result = $case({
      left: () => 0,
      right: (x: number) => x + 1,
    })(value);

    assertEquals(result, boxedValue + 1);
  });

  Rhum.testCase("Right $case missing pattern", () => {
    const boxedValue = 123;
    const value = right<string, number>(boxedValue);

    const result = () =>
      $case({
        left: (x: string) => Number(x),
      })(value);

    assertThrows(() => result());
  });

  Rhum.testCase("kind", () => {
    const leftValue = left<Error, string>(new Error());
    const rightValue = right<Error, string>("123");

    assertEquals(
      ((kindOf<Error, string>(leftValue) as Func)("*") as Func)("*"),
      "*",
    );
    assertEquals(
      ((kindOf<Error, string>(rightValue) as Func)("*") as Func)("*"),
      "*",
    );
  });
});

Rhum.run();
