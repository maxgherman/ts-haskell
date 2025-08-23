import { alternative as createAlternative, Alternative, BaseImplementation } from 'control/alternative/alternative'
import { Type } from 'data/kind'
import { concat, nil, ListBox, cons, toArray, $null } from 'ghc/base/list/list'
import { applicative } from './applicative'

export interface ListAlternative<T> extends Alternative {
    empty(): ListBox<T>
    '<|>'(a: ListBox<T>, b: ListBox<T>): ListBox<T>
    some(fa: ListBox<T>): ListBox<ListBox<T>>
    many(fa: ListBox<T>): ListBox<ListBox<T>>
}

const base = <T>(): BaseImplementation => ({
    empty: () => nil<T>(),
    '<|>': concat as (a: ListBox<T>, b: ListBox<T>) => ListBox<T>,
})

const some = <T>(fa: ListBox<T>): ListBox<ListBox<T>> => {
    if ($null(fa)) {
        return nil()
    }

    const values = toArray(fa)

    const fromArray = (arr: T[]): ListBox<T> => arr.reduceRight((acc, x) => cons(x as NonNullable<T>)(acc), nil<T>())

    function* gen(): Generator<ListBox<T>> {
        let n = 1
        while (true) {
            const idx = Array(n).fill(0)
            while (true) {
                yield fromArray(idx.map((i) => values[i]!))

                let i = n - 1
                while (i >= 0 && idx[i] === values.length - 1) {
                    i--
                }
                if (i < 0) {
                    break
                }
                idx[i]++
                for (let j = i + 1; j < n; j++) {
                    idx[j] = 0
                }
            }
            n++
        }
    }

    const iterator = gen()

    const build = (): ListBox<ListBox<T>> => {
        let cache: unknown = null
        const node = () => {
            if (cache === null) {
                const { value, done } = iterator.next()
                cache = done ? [] : { head: value, tail: build() }
            }
            return cache
        }
        ;(node as unknown as { kind: (_: '*') => Type }).kind = (_: '*') => '*' as Type
        return node as ListBox<ListBox<T>>
    }

    return build()
}

const many = <T>(fa: ListBox<T>): ListBox<ListBox<T>> =>
    concat(some(fa) as unknown as ListBox<ListBox<T>>, cons(nil<T>())(nil()))

export const alternative = <T>(): ListAlternative<T> => {
    const alt = createAlternative(base<T>(), applicative) as ListAlternative<T>
    alt.some = some as (fa: ListBox<T>) => ListBox<ListBox<T>>
    alt.many = many as (fa: ListBox<T>) => ListBox<ListBox<T>>
    return alt
}
