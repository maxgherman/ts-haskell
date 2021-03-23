import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import {
  $case,
  just,
  kindOf,
  nothing,
} from "../../../src/ghc/base/maybe/maybe.ts";

const { asserts: { assertEquals, assertThrows } } = Rhum;

Rhum.testSuite("Maybe", () => {
  Rhum.testCase("Nothing constructor", () => {
    const value = nothing<number>();
    const result = value();

    assertEquals(result, undefined);
  });

  Rhum.testCase("Nothing $case", () => {
    const value = nothing<string>();

    const result = $case({
      nothing: () => 123,
      just: (x) => Number(x),
    })(value);

    assertEquals(result, 123);
  });

  Rhum.testCase("Nothing $case missing pattern", () => {
    const value = nothing<string>();

    const result = () =>
      $case({
        just: (x) => `${x} 123`,
      })(value);

    assertThrows(() => result());
  });

  Rhum.testCase("Just constructor", () => {
    const value = just<number>(123);
    const result = value();

    assertEquals(result, 123);
  });

  Rhum.testCase("Just $case", () => {
    const value = just<string>("123");

    const result = $case({
      nothing: () => "0",
      just: (x) => `${x} 123`,
    })(value);

    assertEquals(result, "123 123");
  });

  Rhum.testCase("Just $case missing pattern", () => {
    const value = just<string>("123");

    const result = () =>
      $case({
        nothing: () => "123",
      })(value);

    assertThrows(() => result());
  });

  Rhum.testCase("kind", () => {
    const justValue = just<string>("123");
    const nothingValue = nothing<string>();

    assertEquals(kindOf(justValue), "*");
    assertEquals(kindOf(nothingValue), "*");
  });
});

Rhum.run();
