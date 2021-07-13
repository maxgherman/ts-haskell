import { Rhum } from "rhum/mod.ts";
import { compose, id } from "ghc/base/functions.ts";
import { $case, EitherBox, left, right } from "data/either/either.ts";
import { functor as eitherF } from "data/either/either-functor.ts";

const { asserts: { assertEquals } } = Rhum;

const functor = eitherF<Error>();
const leftValue = <TL, TR>(x: EitherBox<TL, TR>) =>
  $case<TL, TR, TL>({ left: id })(x);
const rightValue = <TL, TR>(x: EitherBox<TL, TR>) =>
  $case<TL, TR, TR>({ right: id })(x);

Rhum.testSuite("Either functor", () => {
  Rhum.testCase("fmap - right", () => {
    const result = compose<
      number,
      EitherBox<Error, number>,
      EitherBox<Error, number>,
      number
    >(
      rightValue,
      (x) => functor.fmap((x: number) => x * x + Math.pow(x, 2), x),
      right,
    )(3);

    const expected = compose<number, EitherBox<Error, number>, number>(
      rightValue,
      right,
    )(18);

    assertEquals(result, expected);
    assertEquals(result, 18);
  });

  Rhum.testCase("fmap - left", () => {
    const error = new Error("Test");
    const result = compose<
      Error,
      EitherBox<Error, number>,
      EitherBox<Error, number>,
      Error
    >(
      leftValue,
      (x) => functor.fmap((x: number) => x * x + Math.pow(x, 2), x),
      left,
    )(error);

    assertEquals(result, error);
  });

  Rhum.testCase("<$>", () => {
    const result = compose<
      number,
      EitherBox<Error, number>,
      EitherBox<Error, number>,
      number
    >(
      rightValue,
      (x) => functor["<$>"]((x: number) => x * x + x / 2, x),
      right,
    )(3);

    assertEquals(result, 10.5);
  });

  Rhum.testCase("<$", () => {
    const result = compose<
      number,
      EitherBox<Error, number>,
      EitherBox<Error, number>,
      number
    >(
      rightValue,
      (x) => functor["<$"](7, x),
      right,
    )(3);

    assertEquals(result, 7);
  });

  Rhum.testCase("$>", () => {
    const result = compose<
      number,
      EitherBox<Error, number>,
      EitherBox<Error, number>,
      number
    >(
      rightValue,
      (x) => functor["$>"](x, 7),
      right,
    )(3);

    assertEquals(result, 7);
  });

  Rhum.testCase("<&>", () => {
    const result = compose<
      number,
      EitherBox<Error, number>,
      EitherBox<Error, number>,
      number
    >(
      rightValue,
      (x) => functor["<&>"](x, (x: number) => x * x + x / 2),
      right,
    )(3);

    assertEquals(result, 10.5);
  });

  Rhum.testCase("void - left", () => {
    const error = new Error("Test");
    const result = compose<
      Error,
      EitherBox<Error, number>,
      EitherBox<Error, []>,
      Error
    >(
      leftValue,
      functor.void,
      left,
    )(error);

    assertEquals(result, error);
  });

  Rhum.testCase("void - right", () => {
    const result = compose<
      number,
      EitherBox<Error, number>,
      EitherBox<Error, []>,
      []
    >(
      rightValue,
      functor.void,
      right,
    )(3);

    assertEquals(result, []);
  });

  Rhum.testSuite("Functor first law: fmap id = id", () => {
    const fmapId = (fa: EitherBox<Error, number>) => functor.fmap(id, fa);

    Rhum.testCase("Right", () => {
      const result = compose<
        number,
        EitherBox<Error, number>,
        EitherBox<Error, number>,
        number
      >(
        rightValue,
        fmapId,
        right,
      )(3);

      const expected = compose<
        number,
        EitherBox<Error, number>,
        EitherBox<Error, number>,
        number
      >(
        rightValue,
        id,
        right,
      )(3);

      assertEquals(result, 3);
      assertEquals(result, expected);
    });

    Rhum.testCase("Left", () => {
      const error = new Error("Test");
      const result = compose<
        Error,
        EitherBox<Error, number>,
        EitherBox<Error, number>,
        Error
      >(
        leftValue,
        fmapId,
        left,
      )(error);

      const expected = compose<
        Error,
        EitherBox<Error, number>,
        EitherBox<Error, number>,
        Error
      >(
        leftValue,
        id,
        left,
      )(error);

      assertEquals(result, error);
      assertEquals(expected, result);
    });

    Rhum.testSuite("Functor second law: fmap (f . g) = fmap f . fmap g", () => {
      const a = (x: number) => x + 2;
      const b = (x: number) => x * 3;
      const ab = compose(a, b);
      const fA = (fa: EitherBox<Error, number>) => functor.fmap(a, fa);
      const fB = (fb: EitherBox<Error, number>) => functor.fmap(b, fb);
      const fAB = (fab: EitherBox<Error, number>) => functor.fmap(ab, fab);
      const fAfB = compose(fA, fB);

      Rhum.testCase("Right", () => {
        const one = compose<
          number,
          EitherBox<Error, number>,
          EitherBox<Error, number>,
          number
        >(
          rightValue,
          fAB,
          right,
        )(3);

        const two = compose<
          number,
          EitherBox<Error, number>,
          EitherBox<Error, number>,
          number
        >(
          rightValue,
          fAfB,
          right,
        )(3);

        assertEquals(one, 11);
        assertEquals(two, one);
      });

      Rhum.testCase("Left", () => {
        const error = new Error("Test Error");
        const one = compose<
          Error,
          EitherBox<Error, number>,
          EitherBox<Error, number>,
          Error
        >(
          leftValue,
          fAB,
          left,
        )(error);

        const two = compose<
          Error,
          EitherBox<Error, number>,
          EitherBox<Error, number>,
          Error
        >(
          leftValue,
          fAfB,
          left,
        )(error);

        assertEquals(one, error);
        assertEquals(two, one);
      });
    });
  });
});

Rhum.run();
