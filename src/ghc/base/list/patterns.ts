import { $null, head, List, nil, tail } from "./list.ts";

type PatterMatchResult<T> = NonNullable<{
  value: T[];
  rest: List<T>;
  result: boolean;
}>;

type Pattern = undefined[];
export type Case<T> = NonNullable<
  [Pattern, (...params: never[]) => T][]
>;

const matchPatternEntry = <T>(
  entry: PatterMatchResult<T> & { list: List<T> },
  index: number,
  length: number,
): (PatterMatchResult<T> & { list: List<T> }) => {
  const { list, value } = entry;

  if (index === length - 1) {
    if ($null(list)) {
      entry.result = false;
      return entry;
    }

    const rest = tail(list);

    if ($null(rest)) {
      value.push(head(list));
      entry.result = true;
      return entry;
    }

    entry.rest = list;
    entry.result = true;
    return entry;
  }

  if ($null(entry.list)) {
    entry.result = false;
    return entry;
  }

  value.push(head(list));
  entry.list = tail(list);
  return entry;
};

const matchPattern = <T>(p: Pattern, list: List<T>): PatterMatchResult<T> => {
  if (p.length <= 0 && $null(list)) {
    return { value: [], rest: nil(), result: true };
  }

  return p.reduce(
    (acc, _, index) => matchPatternEntry(acc, index, p.length),
    {
      value: [],
      rest: nil(),
      list,
      result: false,
    } as (PatterMatchResult<T> & { list: List<T> }),
  );
};

export const _ = undefined;

export const $case = <T, K>(caseOf: Case<K>) =>
  (list: List<T>): K => {
    if (caseOf.length <= 0) {
      throw new Error("Non-exhaustive patterns for List");
    }

    for (const pattern of caseOf) {
      const matchResult = matchPattern(pattern[0], list);
      if (matchResult.result) {
        const result = (matchResult.rest
          ? [...matchResult.value, matchResult.rest]
          : [...matchResult.value]) as never[];

        return pattern[1](...result);
      }
    }

    throw new Error("Non-exhaustive patterns for List");
  };
