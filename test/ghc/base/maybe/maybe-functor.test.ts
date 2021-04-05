import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose, id } from "../../../../src/ghc/base/functions.ts";
import { functor } from "../../../../src/ghc/base/maybe/maybe-functor.ts";
import {
  $case,
  just,
  Maybe,
  MaybeBox,
  nothing,
} from "../../../../src/ghc/base/maybe/maybe.ts";

type FakeNothing = { isNothing: true };

const { asserts: { assertEquals, assert } } = Rhum;

const $just = <T>(maybe: Maybe<T>) => $case({ just: id })(maybe);
const $nothing = <T>(maybe: Maybe<T>) =>
  $case({ nothing: () => ({ isNothing: true } as FakeNothing) })(maybe);
const ofJust = <T>(x: NonNullable<T>) => just(x);

const fmapId = <T>(fa: MaybeBox<T>) => functor.fmap(id, fa);

Rhum.testSuite("Maybe functor", () => {
  Rhum.testCase("fmap", () => {
    const result = compose(
      $just,
      (m: MaybeBox<number>) =>
        functor.fmap((x: number) => x * x + Math.pow(x, 2), m),
      ofJust,
    )(3);

    const expected = compose<number, Maybe<number>, number>($just, just)(18);

    assertEquals(result, expected);
    assertEquals(18, result);
  });

  Rhum.testCase("<$>", () => {
    const result = compose(
      $just,
      (m: MaybeBox<number>) => functor["<$>"]((x: number) => x * x + x / 2, m),
      ofJust,
    )(3);

    assertEquals(result, 10.5);
  });

  Rhum.testCase("<$", () => {
    const result = compose(
      $just,
      (m: MaybeBox<number>) => functor["<$"](7, m),
      ofJust,
    )(3);

    assertEquals(result, 7);
  });

  Rhum.testCase("$>", () => {
    const result = compose(
      $just,
      (m: MaybeBox<number>) => functor["$>"](m, 7),
      ofJust,
    )(3);

    assertEquals(result, 7);
  });

  Rhum.testCase("<&>", () => {
    const result = compose(
      $just,
      (m: MaybeBox<number>) => functor["<&>"](m, (x: number) => x * x + x / 2),
      ofJust,
    )(3);

    assertEquals(result, 10.5);
  });

  Rhum.testCase("void - Just", () => {
    const result = compose<number, MaybeBox<number>, MaybeBox<[]>, []>(
      $just as ((x: MaybeBox<[]>) => []),
      functor.void,
      ofJust,
    )(3);

    assertEquals(result, []);
  });

  Rhum.testCase("void - Nothing", () => {
    const result = compose<MaybeBox<number>, MaybeBox<[]>, FakeNothing>(
      $nothing,
      functor.void,
    )(nothing());

    assert(result.isNothing);
  });

  Rhum.testSuite("Functor first law: fmap id = id", () => {
    Rhum.testCase("Just", () => {
      const argument = just(3);
      const result = fmapId(argument);
      const expected = id(argument);

      assertEquals($just(result), 3);
      assertEquals($just(expected), $just(result));
    });

    Rhum.testCase("Nothing", () => {
      const argument = nothing();
      const result = fmapId(argument);
      const expected = id(argument);

      assert($nothing(expected).isNothing);
      assert($nothing(result).isNothing);
    });
  });

  Rhum.testSuite("Functor second law: fmap (f . g) = fmap f . fmap g", () => {
    const a = (x: number) => x + 2;
    const b = (x: number) => x * 3;
    const ab = compose(a, b);
    const fA = (fa: MaybeBox<number>) => functor.fmap(a, fa);
    const fB = (fb: MaybeBox<number>) => functor.fmap(b, fb);
    const fAB = (fab: MaybeBox<number>) => functor.fmap(ab, fab);
    const fAfB = compose<MaybeBox<number>, MaybeBox<number>, MaybeBox<number>>(
      fA,
      fB,
    );

    Rhum.testCase("Just", () => {
      const argument = just(3);
      const one = fAB(argument);
      const two = fAfB(argument);

      assertEquals($just(one), 11);
      assertEquals($just(one), $just(two));
    });

    Rhum.testCase("Nothing", () => {
      const argument = nothing<number>();
      const one = fAB(argument);
      const two = fAfB(argument);

      assert($nothing(one).isNothing);
      assert($nothing(two).isNothing);
    });
  });
});

Rhum.run();
