import { Rhum } from "rhum/mod.ts";
import { compose, id } from "ghc/base/functions.ts";
import { semigroup as createSemigroup } from "data/either/either-semigroup.ts";
import { $case, left, right } from "data/either/either.ts";
import { formList } from "ghc/base/non-empty/list.ts";
import { cons, nil } from "ghc/base/list/list.ts";

const { asserts: { assertEquals } } = Rhum;

const semigroup = createSemigroup<Error, string>();

const caseErrorMessage = $case<Error, string, string>({
  left: (error) => error.message,
});
const caseString = $case<Error, string, string>({ right: id });

Rhum.testSuite("EitherSemigroup", () => {
  Rhum.testCase("<>", () => {
    const error1 = new Error("error 1");
    const error2 = new Error("error 2");

    const value1 = left<Error, string>(error1);
    const value2 = left<Error, string>(error2);
    const value3 = right<Error, string>("Hello");
    const value4 = right<Error, string>(" world");

    const result1 = semigroup["<>"](value1, value2);
    const result2 = semigroup["<>"](value1, value3);
    const result3 = semigroup["<>"](value4, value2);
    const result4 = semigroup["<>"](value3, value4);

    assertEquals(caseErrorMessage(result1), error2.message);
    assertEquals(caseString(result2), "Hello");
    assertEquals(caseString(result3), " world");
    assertEquals(caseString(result4), "Hello");
  });

  Rhum.testCase("sconcat", () => {
    const value = compose(
      formList,
      cons(right<Error, string>("Hello")),
      cons(right<Error, string>(" ")),
      cons(left<Error, string>(new Error("test error"))),
      cons(right<Error, string>("world")),
      nil,
    )(id);

    const result = semigroup.sconcat(value);

    assertEquals(caseString(result), "Hello");
  });

  Rhum.testCase("stimes", () => {
    const result1 = semigroup.stimes(
      10,
      left<Error, string>(new Error("test error")),
    );
    const result2 = semigroup.stimes(10, right<Error, string>("Test"));

    assertEquals(caseErrorMessage(result1), "test error");
    assertEquals(caseString(result2), "Test");
  });

  Rhum.testSuite("semigroup law: (x <> y) <> z = x <> (y <> z)", () => {
    const error1 = left<Error, string>(new Error("error 1"));
    const error2 = left<Error, string>(new Error("error 2"));
    const error3 = left<Error, string>(new Error("error 3"));

    const value1 = right<Error, string>("value 1");
    const value2 = right<Error, string>("value 2");
    const value3 = right<Error, string>("value 3");

    const result1 = semigroup["<>"](semigroup["<>"](error1, error2), error3);
    const result2 = semigroup["<>"](error1, semigroup["<>"](error2, error3));

    const result3 = semigroup["<>"](semigroup["<>"](value1, value2), value3);
    const result4 = semigroup["<>"](value1, semigroup["<>"](value2, value3));

    assertEquals(caseErrorMessage(result1), "error 3");
    assertEquals(caseErrorMessage(result2), "error 3");

    assertEquals(caseString(result3), "value 1");
    assertEquals(caseString(result4), "value 1");
  });
});

Rhum.run();
