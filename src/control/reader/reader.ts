import { MinBox0 } from 'data/kind'
import { FunctionArrow, FunctionArrowBox, withKind } from 'ghc/prim/function-arrow'

export type Reader<R, A> = FunctionArrow<R, A>

export type ReaderBox<R, A> = FunctionArrowBox<R, A>

export type ReaderMinBox<R, A> = FunctionArrowBox<R, MinBox0<A>>

export const reader = <R, A>(fn: Reader<R, A>): ReaderBox<R, A> => withKind(fn)

export const runReader = <R, A>(fn: Reader<R, A>, r: R): A => fn(r)
