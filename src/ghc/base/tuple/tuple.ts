import { Box0, Kind } from "../../../data/kind.ts";

export type UnitBox = [] & Box0<unknown>;

export type Tuple2Box<T1, T2> = [T1, T2] & Box0<unknown>;

export const fst = <T1, T2>(tuple: [T1, T2] | Tuple2Box<T1, T2>): T1 =>
  tuple[0];

export const snd = <T1, T2>(tuple: [T1, T2] | Tuple2Box<T1, T2>): T2 =>
  tuple[1];

export const unit = (): UnitBox =>
  Object.create([], {
    kind: {
      value: "*" as Kind,
    },
  });

export const tuple2 = <T1, T2>(a: T1, b: T2): Tuple2Box<T1, T2> =>
  Object.create([a, b], {
    kind: {
      value: (_: "*") => (_: "*") => "*" as Kind,
    },
  });
