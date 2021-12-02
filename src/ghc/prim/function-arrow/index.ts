import { Box2 } from 'data/kind'

export type FunctionArrow<A, B> = (_: A) => B

export type FunctionArrowBox<A, B> = FunctionArrow<A, B> & Box2<A, B>

export const withKind = <A, B>(base: FunctionArrow<A, B>): FunctionArrowBox<A, B> => base as FunctionArrowBox<A, B>