import { alternative as createAlternative, Alternative, BaseImplementation } from 'control/alternative/alternative'
import { Type } from 'data/kind'
import { concat, nil, ListBox, cons, map, $null, head, tail } from 'ghc/base/list/list'
import { comp } from './comprehension'
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

    const buildN = (n: number): ListBox<ListBox<T>> => {
        if (n === 1) {
            return map((x: T) => cons(x as NonNullable<T>)(nil<T>()), fa)
        }
        return comp((x: T, xs: ListBox<T>) => cons(x as NonNullable<T>)(xs), [fa, buildN(n - 1)])
    }

    const append = (xs: ListBox<ListBox<T>>, ys: () => ListBox<ListBox<T>>): ListBox<ListBox<T>> => {
        const node = () => {
            if ($null(xs)) {
                return ys()()
            }
            return {
                head: head(xs) as ListBox<T>,
                tail: append(tail(xs) as ListBox<ListBox<T>>, ys),
            }
        }
        ;(node as unknown as { kind: (_: '*') => Type }).kind = (_: '*') => '*' as Type
        return node as ListBox<ListBox<T>>
    }

    const build = (n: number): ListBox<ListBox<T>> => append(buildN(n), () => build(n + 1))

    return build(1)
}

const many = <T>(fa: ListBox<T>): ListBox<ListBox<T>> =>
    concat(some(fa) as unknown as ListBox<ListBox<T>>, cons(nil<T>())(nil()))

export const alternative = <T>(): ListAlternative<T> => {
    const alt = createAlternative(base<T>(), applicative) as ListAlternative<T>
    alt.some = some as (fa: ListBox<T>) => ListBox<ListBox<T>>
    alt.many = many as (fa: ListBox<T>) => ListBox<ListBox<T>>
    return alt
}
