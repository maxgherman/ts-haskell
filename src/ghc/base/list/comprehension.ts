import { List, $null, head, tail, nil } from './list'

function* crossJoin<T>([first, ...rest]: List<T>[]) {
    const remainder = (rest.length > 0 ? crossJoin(rest) : [[]]) as Generator<T[], void, unknown>

    for (const values of remainder) {
        let list = first

        while (list && !$null(list)) {
            const value = head(list)
            yield [value, ...values]

            list = tail(list)
        }
    }
}

export function comp<T, T1>(output: (_: T1) => T, input: [List<T1>], filters?: ((_: T) => boolean)[]): List<T>
export function comp<T, T1, T2>(
    output: (_: T1, __: T2) => T,
    input: [List<T1>, List<T2>],
    filters?: ((_: T1, __: T2) => boolean)[],
): List<T>
export function comp<T, T1, T2, T3>(
    output: (x1: T1, x2: T2, x3: T3) => T,
    input: [List<T1>, List<T2>, List<T3>],
    filters?: ((x1: T1, x2: T2, x3: T3) => boolean)[],
): List<T>
export function comp<T, T1, T2, T3, T4>(
    output: (x1: T1, x2: T2, x3: T3, x4: T4) => T,
    input: [List<T1>, List<T2>, List<T3>, List<T4>],
    filters?: ((x1: T1, x2: T2, x3: T3, x4: T4) => boolean)[],
): List<T>

export function comp<T>(
    output: (...args: unknown[]) => T,
    input: List<unknown>[],
    filters: ((...args: unknown[]) => boolean)[] = [],
): List<T> {
    const generator = crossJoin(input)
    const values: Map<number, unknown[]> = new Map()

    const list = (step: number): List<T> => {
        if (values.has(step)) {
            const headValue = values.get(step) as T[]

            return () => ({
                head: output(...headValue),
                tail: list(step + 1),
            })
        }

        const next = generator.next()

        if (!next.done) {
            values.set(step, next.value)
            return list(step)
        }

        return nil<T>()
    }

    return list(1)
}

// https://github.com/WimJongeneel/ts-comprehension/blob/master/src/comprehension.ts

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-6.html
