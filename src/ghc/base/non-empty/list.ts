import { Box1, Type } from 'data/kind'
import { compose, Slack } from 'ghc/base/functions'
import { fst, snd } from 'ghc/base/tuple/tuple'
import { cons as listCons, head as listHead, List, ListBox, map as listMap, tail as listTail } from 'ghc/base/list/list'
import { $case as listCase, _ as __, Case } from 'ghc/base/list/patterns'
import { just, MaybeBox, nothing } from 'ghc/base/maybe/maybe'

export type NonEmpty<T> = Slack<[NonNullable<T>, List<T>]>

export type NonEmptyBox<T> = Box1<T> & NonEmpty<T>

export const nonEmpty = <T>(list: List<T>): MaybeBox<NonEmptyBox<T>> =>
    listCase<T, MaybeBox<NonEmptyBox<T>>>([
        [[], () => nothing<MaybeBox<NonEmptyBox<T>>>()],
        [
            [__],
            (head, tail) => {
                const result = () => (tail ? [head, tail] : [listHead(head), listTail(head)])
                result.kind = (_: '*') => '*' as Type
                return just(result)
            },
        ],
    ])(list)

export const cons =
    <T>(value: NonNullable<T>) =>
    (list: ListBox<T>) =>
        formList<T>(listCons(value)(list))

export const head = <T>(nonEmp: NonEmpty<T>): NonNullable<T> => fst(nonEmp())

export const tail = <T>(nonEmp: NonEmpty<T>): ListBox<T> => snd(nonEmp()) as ListBox<T>

export const formList = <T>(list: List<T>): NonEmptyBox<T> =>
    listCase<T, NonEmptyBox<T>>([
        [
            [],
            () => {
                throw new Error('NonEmpty.fromList: empty list')
            },
        ],
        [
            [__],
            (head, tail) => {
                const result = () => (tail ? [head, tail] : [listHead(head), listTail(head)])
                result.kind = (_: '*') => '*' as Type
                return result as NonEmptyBox<T>
            },
        ],
    ])(list)

export const toList = <T>(nonEmp: NonEmpty<T>): ListBox<T> =>
    compose<NonEmpty<T>, [NonNullable<T>, List<T>], ListBox<T>>(
        (source) => listCons(fst(source))(snd(source)),
        (value: NonEmpty<T>) => value(),
    )(nonEmp)

export const map = <T1, T2>(f: (_: T1) => NonNullable<T2>, nonEmp: NonEmpty<T1>): NonEmptyBox<T2> =>
    compose<NonEmpty<T1>, [NonNullable<T1>, List<T1>], NonEmptyBox<T2>>(
        (source) => {
            const result = () => [f(fst(source)), listMap(f, snd(source))]
            result.kind = (_: '*') => '*' as Type
            return result as NonEmptyBox<T2>
        },
        (value: NonEmpty<T1>) => value(),
    )(nonEmp)

export const _ = __

export const $case =
    <T, K>(caseOf: Case<K>) =>
    (nonEmptyList: NonEmpty<T>): K =>
        compose(listCase(caseOf), toList)(nonEmptyList)
