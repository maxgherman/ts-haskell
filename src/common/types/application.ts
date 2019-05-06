export type Application<A, B> = (a: A) => B

export type Application2<A, B, C> = (a: A) => (b: B) => C

export type Application3<A, B, C, D> = (a: A) => (b: B) => (c: C) => D
