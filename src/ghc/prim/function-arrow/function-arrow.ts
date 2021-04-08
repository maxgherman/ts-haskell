import { Box2 } from "../../../data/kind.ts";

export type FunctionArrow<A, B> = (_: A) => B;

export type FunctionArrowBox<A, B> = FunctionArrow<A, B> & Box2<A, B>;
