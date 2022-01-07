export type Func = (...args: unknown[]) => unknown

export type Slack<T> = () => T // synonym to Lazy

// id :: a -> a
export const id = <A>(x: A) => x

// const :: a -> b -> a
export const $const =
    <A, B>(a: A) =>
    (_: B) =>
        a

// flip :: (a -> b -> c) -> b -> a -> c
export const flip =
    <A, B, C>(f: (_: A, __: B) => C) =>
    (y: B, x: A) =>
        f(x, y)

export type Dot<A, B, C> = (f: (_: B) => C) => (g: (_: A) => B) => (a: A) => C

export const dot =
    <B, C>(f: (_: B) => C) =>
    <A>(g: (_: A) => B) =>
    (a: A): C =>
        f(g(a))

export function compose<T0, T1>(f0: (x: T0) => T1): (x: T0) => T1

export function compose<T0 extends unknown[], T1>(f0: (...args: T0) => T1): (...args: T0) => T1

export function compose<T0, T1, T2>(f1: (x: T1) => T2, f0: (x: T0) => T1): (x: T0) => T2

export function compose<T0 extends unknown[], T1, T2>(f1: (x: T1) => T2, f0: (...args: T0) => T1): (...args: T0) => T2

export function compose<T0, T1, T2, T3>(f2: (x: T2) => T3, f1: (x: T1) => T2, f0: (x: T0) => T1): (x: T0) => T3

export function compose<T0 extends unknown[], T1, T2, T3>(
    f2: (x: T3) => T3,
    f1: (x: T1) => T2,
    f0: (...args: T0) => T1,
): (...args: T0) => T2

export function compose<T0, T1, T2, T3, T4>(
    f3: (x: T3) => T4,
    f2: (x: T2) => T3,
    f1: (x: T1) => T2,
    f0: (x: T0) => T1,
): (x: T0) => T4

export function compose<T0, T1, T2, T3, T4, T5>(
    f4: (x: T4) => T5,
    f3: (x: T3) => T4,
    f2: (x: T2) => T3,
    f1: (x: T1) => T2,
    f0: (x: T0) => T1,
): (x: T0) => T5

export function compose<T0, T1, T2, T3, T4, T5, T6>(
    f5: (x: T5) => T6,
    f4: (x: T4) => T5,
    f3: (x: T3) => T4,
    f2: (x: T2) => T3,
    f1: (x: T1) => T2,
    f0: (x: T0) => T1,
): (x: T0) => T6

export function compose<T0, T1, T2, T3, T4, T5, T6, T7>(
    f6: (x: T5) => T7,
    f5: (x: T5) => T6,
    f4: (x: T4) => T5,
    f3: (x: T3) => T4,
    f2: (x: T2) => T3,
    f1: (x: T1) => T2,
    f0: (x: T0) => T1,
): (x: T0) => T7

export function compose(...fns: Func[]) {
    return (...args: unknown[]) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0]
}
