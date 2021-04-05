import { Rhum } from "https://deno.land/x/rhum@v1.1.7/mod.ts";
import { compose, id } from "../../../../src/ghc/base/functions.ts";
import {
  cons,
  head,
  ListBox,
  nil,
  tail,
  toArray,
} from "../../../../src/ghc/base/list/list.ts";
import { functor } from "../../../../src/ghc/base/list/list-functor.ts";

const { asserts: { assertEquals } } = Rhum;

const empty = nil<number>();
const list3 = cons(3)(nil());

Rhum.testSuite("List functor", () => {
  Rhum.testCase("fmap", () => {
    const result = functor.fmap((x: number) => x * x + Math.pow(x, 2), list3);

    assertEquals(head(result), 18);
    assertEquals(toArray(tail(result)), []);
  });

  Rhum.testCase("<$>", () => {
    const result = functor["<$>"]((x: number) => x * x + x / 2, list3);
    assertEquals(head(result), 10.5);
  });

  Rhum.testCase("<$", () => {
    const result = functor["<$"](7, list3);
    assertEquals(head(result), 7);
  });

  Rhum.testCase("$>", () => {
    const result = functor["$>"](list3, 7);
    assertEquals(head(result), 7);
  });

  Rhum.testCase("<&>", () => {
    const result = functor["<&>"](list3, (x: number) => x * x + x / 2);
    assertEquals(head(result), 10.5);
  });

  Rhum.testCase("void", () => {
    const result = functor.void(list3);
    assertEquals(head(result), []);
  });

  Rhum.testSuite("Functor first law: fmap id = id", () => {
    const fmapId = (fa: ListBox<number>): ListBox<number> =>
      functor.fmap<number, number>(id, fa);

    Rhum.testCase("empty", () => {
      const result = fmapId(empty);
      const expected = id(empty);

      assertEquals(toArray(result), []);
      assertEquals(toArray(result), toArray(expected));
    });

    Rhum.testCase("non - empty", () => {
      const result = fmapId(list3);
      const expected = id(list3);

      assertEquals(head(result), 3);
      assertEquals(head(result), head(expected));
    });
  });

  Rhum.testSuite("Functor second law: fmap (f . g) = fmap f . fmap g", () => {
    const a = (x: number) => x + 2;
    const b = (x: number) => x * 3;
    const ab = compose(a, b);
    const fA = (fa: ListBox<number>) => functor.fmap(a, fa);
    const fB = (fb: ListBox<number>) => functor.fmap(b, fb);
    const fAB = (fab: ListBox<number>) => functor.fmap(ab, fab);
    const fAfB = compose(fA, fB);

    Rhum.testCase("empty", () => {
      const one = fAB(empty);
      const two = fAfB(empty);

      assertEquals(toArray(one), []);
      assertEquals(toArray(two), []);
    });

    Rhum.testCase("non - empty", () => {
      const one = fAB(list3);
      const two = fAfB(list3);

      assertEquals(head(one), 11);
      assertEquals(head(one), head(two));
    });
  });
});

Rhum.run();
