import { Slack } from 'ghc/base/functions'
import { Box1, Kind, Type } from 'data/kind'

type Nil = []
type ListItem<T> = {
    head: T
    tail: List<T>
}

export type List<T> = NonNullable<Slack<Nil | ListItem<T>>>

export type ListBox<T> = Box1<T> & List<T>

const isEmptyArray = (value: unknown) => Array.isArray(value) && value.length === 0

export const kindOf = <T>(_: List<T>): Kind => '*'

export const nil = <T>(): ListBox<T> => {
    const result = () => [] as Nil
    result.kind = (_: '*') => '*' as Type

    return result
}

export const cons =
    <T>(value: NonNullable<T>) =>
    (list: List<T>): ListBox<T> => {
        const result = () => ({
            head: value,
            tail: list,
        })
        result.kind = (_: '*') => '*' as Type

        return result
    }

export const head = <T>(list: List<T>): T => {
    const listValue = list()

    if (isEmptyArray(listValue)) {
        throw new Error('Exception: empty List')
    }

    return (listValue as ListItem<T>).head
}

export const tail = <T>(list: List<T>): ListBox<T> => {
    const listValue = list()

    if (isEmptyArray(listValue)) {
        throw new Error('Exception: empty List')
    }

    return (listValue as ListItem<T>).tail as ListBox<T>
}

export const $null = <T>(list: List<T>) => isEmptyArray(list())

export const map = <T1, T2>(f: (_: T1) => NonNullable<T2>, list: List<T1>): ListBox<T2> => {
    if ($null(list)) {
        return nil()
    }

    const result = () => ({
        head: f(head(list)),
        tail: map(f, tail(list)),
    })

    result.kind = (_: '*') => '*' as Type

    return result
}

export const concat = <T>(list1: List<T>, list2: List<T>): ListBox<T> => {
    if ($null(list1)) {
        return list2 as ListBox<T>
    }

    const result = () => ({
        head: head(list1) as NonNullable<T>,
        tail: concat(tail(list1), list2),
    })

    result.kind = (_: '*') => '*' as Type

    return result
}

export const take = <T>(n: number, list: List<T>): ListBox<T> => {
    if (n <= 0) {
        return nil<T>()
    }

    if ($null(list)) {
        return nil<T>()
    }

    const next = take(n - 1, tail(list))
    return cons(head(list) as NonNullable<T>)(next)
}

export const repeat = <T>(a: NonNullable<T>): ListBox<T> => {
    const result = () => ({
        head: a,
        tail: repeat(a),
    })

    result.kind = (_: '*') => '*' as Type

    return result
}

export const toArray = <T>(list: List<T> | ListBox<T>): T[] => {
    if ($null(list)) {
        return []
    }

    return [head(list)].concat(toArray(tail(list)))
}
