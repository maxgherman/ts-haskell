import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose, id } from "../../../../src/ghc/base/functions.ts";
import { functor as createFunctor } from "../../../../src/ghc/base/tuple/tuple2-functor.ts";
import {
  fst,
  snd,
  tuple2,
  Tuple2Box,
} from "../../../../src/ghc/base/tuple/tuple.ts";

const { asserts: { assertEquals, assert } } = Rhum;

const functor = createFunctor<string>();
const fmapId = <T>(fa: Tuple2Box<string, T>) => functor.fmap(id, fa);

Rhum.testSuite("Tuple2 functor", () => {
  Rhum.testCase("fmap", () => {
    const result = functor.fmap((x) => x * x, tuple2("test", 3));

    assertEquals(fst(result), "test");
    assertEquals(snd(result), 9);
  });

  Rhum.testCase("<$>", () => {
    const result = functor["<$>"](
      (x: number) => x * x + x / 2,
      tuple2("test", 3),
    );

    assertEquals(fst(result), "test");
    assertEquals(snd(result), 10.5);
  });

  Rhum.testCase("<$", () => {
    const result = functor["<$"](7, tuple2("test", 3));

    assertEquals(fst(result), "test");
    assertEquals(snd(result), 7);
  });

  Rhum.testCase("$>", () => {
    const result = functor["$>"](tuple2("test", 3), 7);

    assertEquals(fst(result), "test");
    assertEquals(snd(result), 7);
  });

  Rhum.testCase("<&>", () => {
    const result = functor["<&>"](
      tuple2("test", 3),
      (x: number) => x * x + x / 2,
    );

    assertEquals(fst(result), "test");
    assertEquals(snd(result), 10.5);
  });

  Rhum.testCase("void", () => {
    const result = functor.void(tuple2("test", 3));

    assertEquals(fst(result), "test");
    assertEquals(snd(result), []);
  });

  Rhum.testCase("Functor first law: fmap id = id", () => {
    const argument = tuple2("test", 3);
    const result = fmapId(argument);
    const expected = id(argument);

    assertEquals(snd(result), 3);
    assertEquals(snd(expected), snd(result));
  });

  Rhum.testCase("Functor second law: fmap (f . g) = fmap f . fmap g", () => {
    const a = (x: number) => x + 2;
    const b = (x: number) => x * 3;
    const ab = compose(a, b);
    const fA = (fa: Tuple2Box<string, number>) => functor.fmap(a, fa);
    const fB = (fb: Tuple2Box<string, number>) => functor.fmap(b, fb);
    const fAB = (fab: Tuple2Box<string, number>) => functor.fmap(ab, fab);
    const fAfB = compose(fA, fB);

    const argument = tuple2("test", 3);
    const one = fAB(argument);
    const two = fAfB(argument);

    assertEquals(snd(one), 11);
    assertEquals(snd(two), 11);
  });
});

Rhum.run();
