import { Type } from 'data/kind'
import { List, ListBox, $null, head, tail } from './list'

function* crossJoinList<T>(...lists: List<T>[]): Generator<T[], void> {
    if (lists.length === 0) {
        yield []
        return
    }

    const [first, ...rest] = lists
    let list = first

    while (list && !$null(list)) {
        const headValue = head(list)
        for (const tailValues of crossJoinList<T>(...rest)) {
            yield [headValue, ...tailValues]
        }
        list = tail(list)
    }
}

export function comp<T, T1>(output: (_: T1) => T, input: [List<T1>], filters?: ((_: T) => boolean)[]): ListBox<T>
export function comp<T, T1, T2>(
    output: (_: T1, __: T2) => T,
    input: [List<T1>, List<T2>],
    filters?: ((_: T1, __: T2) => boolean)[],
): ListBox<T>
export function comp<T, T1, T2, T3>(
    output: (x1: T1, x2: T2, x3: T3) => T,
    input: [List<T1>, List<T2>, List<T3>],
    filters?: ((x1: T1, x2: T2, x3: T3) => boolean)[],
): ListBox<T>
export function comp<T, T1, T2, T3, T4>(
    output: (x1: T1, x2: T2, x3: T3, x4: T4) => T,
    input: [List<T1>, List<T2>, List<T3>, List<T4>],
    filters?: ((x1: T1, x2: T2, x3: T3, x4: T4) => boolean)[],
): ListBox<T>

export function comp<T>(
    output: (...args: unknown[]) => T,
    input: List<unknown>[],
    filters: ((...args: unknown[]) => boolean)[] = [],
): ListBox<T> {
    const generator = crossJoinList(...input)

    const build = (): ListBox<T> => {
        let cache: unknown = null

        const node = () => {
            if (cache === null) {
                let next = generator.next()

                while (!next.done && !filters.every((filter) => filter(...(next.value as unknown[])))) {
                    next = generator.next()
                }

                cache = next.done
                    ? []
                    : {
                          head: output(...(next.value as unknown[])),
                          tail: build(),
                      }
            }

            return cache
        }

        ;(node as unknown as { kind: (_: '*') => Type }).kind = (_: '*') => '*' as Type

        return node as ListBox<T>
    }

    return build()
}
