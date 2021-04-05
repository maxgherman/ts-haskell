import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose, id } from "../../../../src/ghc/base/functions.ts";
import { cons, nil, toArray } from "../../../../src/ghc/base/list/list.ts";
import {
  formList,
  head,
  NonEmptyBox,
  tail,
} from "../../../../src/ghc/base/non-empty/list.ts";
import { functor } from "../../../../src/ghc/base/non-empty/list-functor.ts";

const { asserts: { assertEquals } } = Rhum;

const nonEmpty3: NonEmptyBox<number> = compose(formList, cons(3))(
  nil<number>(),
);

Rhum.testSuite("NonEmpty functor", () => {
  Rhum.testCase("fmap", () => {
    const result = functor.fmap(
      (x: number) => x * x + Math.pow(x, 2),
      nonEmpty3,
    );

    assertEquals(head(result), 18);
    assertEquals(toArray(tail(result)), []);
  });

  Rhum.testCase("<$>", () => {
    const result = functor["<$>"]((x: number) => x * x + x / 2, nonEmpty3);
    assertEquals(head(result), 10.5);
  });

  Rhum.testCase("<$", () => {
    const result = functor["<$"](7, nonEmpty3);
    assertEquals(head(result), 7);
  });

  Rhum.testCase("$>", () => {
    const result = functor["$>"](nonEmpty3, 7);
    assertEquals(head(result), 7);
  });

  Rhum.testCase("<&>", () => {
    const result = functor["<&>"](nonEmpty3, (x: number) => x * x + x / 2);
    assertEquals(head(result), 10.5);
  });

  Rhum.testCase("void", () => {
    const result = functor.void(nonEmpty3);
    assertEquals(head(result), []);
  });

  Rhum.testSuite("Functor first law: fmap id = id", () => {
    const fmapId = (fa: NonEmptyBox<number>): NonEmptyBox<number> =>
      functor.fmap<number, number>(id, fa);

    Rhum.testCase("non - empty", () => {
      const result = fmapId(nonEmpty3);
      const expected = id(nonEmpty3);

      assertEquals(head(result), 3);
      assertEquals(head(result), head(expected));
    });
  });

  Rhum.testSuite("Functor second law: fmap (f . g) = fmap f . fmap g", () => {
    const a = (x: number) => x + 2;
    const b = (x: number) => x * 3;
    const ab = compose(a, b);
    const fA = (fa: NonEmptyBox<number>) => functor.fmap(a, fa);
    const fB = (fb: NonEmptyBox<number>) => functor.fmap(b, fb);
    const fAB = (fab: NonEmptyBox<number>) => functor.fmap(ab, fab);
    const fAfB = compose(fA, fB);

    Rhum.testCase("non - empty", () => {
      const one = fAB(nonEmpty3);
      const two = fAfB(nonEmpty3);

      assertEquals(head(one), 11);
      assertEquals(head(one), head(two));
    });
  });
});

Rhum.run();
