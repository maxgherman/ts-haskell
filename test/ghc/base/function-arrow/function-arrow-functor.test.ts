import { Rhum } from "rhum/mod.ts";
import { compose, id } from "ghc/base/functions.ts";
import {
  functor as createFunctor,
} from "ghc/base/function-arrow/function-arrow-functor.ts";
import {
  FunctionArrowBox,
  withKind,
} from "ghc/prim/function-arrow/function-arrow.ts";

const { asserts: { assertEquals } } = Rhum;
const functor = createFunctor<number>();
const add1Arrow = withKind((x: number) => x.toString() + "1");

Rhum.testSuite("FunctionArrowFunctor functor", () => {
  Rhum.testCase("fmap", () => {
    const result = functor.fmap(
      (x: string) => x + "0",
      add1Arrow,
    );

    assertEquals(result(124), "12410");
  });

  Rhum.testCase("<$>", () => {
    const result = functor["<$>"]((x: string) => x + "-", add1Arrow);
    assertEquals(result(123), "1231-");
  });

  Rhum.testCase("<$", () => {
    const result = functor["<$"]("--", add1Arrow);
    assertEquals(result(123), "--");
  });

  Rhum.testCase("$>", () => {
    const result = functor["$>"](add1Arrow, "--");
    assertEquals(result(123), "--");
  });

  Rhum.testCase("<&>", () => {
    const result = functor["<&>"](add1Arrow, (x: string) => x + "---");
    assertEquals(result(123), "1231---");
  });

  Rhum.testCase("void", () => {
    const result = functor.void(add1Arrow);
    assertEquals(result(123), []);
  });

  Rhum.testSuite("Functor first law: fmap id = id", () => {
    const fmapId = (fa: FunctionArrowBox<number, string>) =>
      functor.fmap(id, fa);

    const result = fmapId(add1Arrow);
    const expected = id(add1Arrow);

    assertEquals(result(123), "1231");
    assertEquals(result(123), expected(123));
  });

  Rhum.testCase("Functor second law: fmap (f . g) = fmap f . fmap g", () => {
    const a = (x: string) => x + x;
    const b = (x: string) => x.slice(2, 4);
    const ab = compose(a, b);
    const fA = (fa: FunctionArrowBox<number, string>) => functor.fmap(a, fa);
    const fB = (fb: FunctionArrowBox<number, string>) => functor.fmap(b, fb);
    const fAB = (fab: FunctionArrowBox<number, string>) =>
      functor.fmap(ab, fab);
    const fAfB = compose(fA, fB);

    const one = fAB(add1Arrow);
    const two = fAfB(add1Arrow);

    assertEquals(one(123), "3131");
    assertEquals(two(123), one(123));
  });
});

Rhum.run();
