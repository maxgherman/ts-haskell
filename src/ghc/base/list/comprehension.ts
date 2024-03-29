import { Type } from 'data/kind'
import { List, ListBox, $null, head, tail, cons, nil } from './list'

function* crossJoinList<T>(...lists: List<T>[]) {
    if (lists.length <= 0) {
        yield []
        return
    }

    if (lists.length <= 1) {
        let list = lists[0]
        while (list && !$null(list)) {
            const headValue = head(list)
            yield [headValue]
            list = tail(list)
        }
        return
    }

    let result = lists[0] as List<T[]>
    for (let i = 1; i < lists.length; i++) {
        const fmap: T[][] = []
        let tempResult = result

        while (tempResult && !$null(tempResult)) {
            const tempResultHead = head(tempResult)
            const map: T[][] = []

            let current = lists[i]
            while (current && !$null(current)) {
                const currentHead = head(current)
                const result = [tempResultHead, currentHead].flat() as T[]

                if (result.length === lists.length) {
                    yield result
                }

                map.push(result)

                current = tail(current)
            }

            fmap.push(...map)

            tempResult = tail(tempResult)
        }

        if (i !== lists.length - 1) {
            let resultTail = nil<T[]>()
            for (let j = fmap.length - 1; j >= 0; j--) {
                resultTail = cons(fmap[j] as T[])(resultTail)
            }

            result = resultTail
        }
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
    const values: Map<number, unknown[]> = new Map()

    const list = (step: number): ListBox<T> => {
        if (values.has(step)) {
            const headValue = values.get(step) as T[]

            const result = () => ({
                head: output(...headValue),
                tail: list(step + 1),
            })

            result.kind = (_: '*') => '*' as Type
            return result
        }

        let next = generator.next()

        while (!next.done && !filters.every((filter) => filter(...(next.value as T[])))) {
            next = generator.next()
        }

        if (next.done) {
            return nil<T>()
        }

        values.set(step, next.value)
        return list(step)
    }

    return list(1)
}
