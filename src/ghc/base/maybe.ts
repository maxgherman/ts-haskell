import { Box1, Kind, Type } from "../../data/kind.ts";

type Nothing = () => void;
type Just<T> = () => NonNullable<T>;

export type Maybe<T> = Nothing | Just<T>;

export type MaybeBox<T> = Box1<T> & Maybe<T>;

type Case<T, K> = {
  nothing?: NonNullable<() => K>;
  just?: NonNullable<(_: T) => K>;
};

export const kindOf = <T>(_: Maybe<T>): Kind => "*";

export const nothing = <T>(): MaybeBox<T> => {
  const result = () => {};
  result.kind = (_: "*") => "*" as Type;

  return result;
};

export const just = <T>(value: NonNullable<T>): MaybeBox<T> => {
  const result = () => value;
  result.kind = (_: "*") => "*" as Type;

  return result;
};

export const $case = <T, K>(caseOf: Case<T, K>) =>
  (maybe: Maybe<T>): K => {
    const value = maybe();

    if (value == null || value === undefined) {
      if (!caseOf.nothing) {
        throw new Error("Non-exhaustive patterns for Nothing");
      }

      return caseOf.nothing();
    }

    if (!caseOf.just) {
      throw new Error("Non-exhaustive patterns for Just");
    }

    return caseOf.just(value);
  };
