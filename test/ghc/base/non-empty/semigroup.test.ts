import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { semigroup as createSemigroup } from 'ghc/base/non-empty/semigroup'
import { cons, formList, NonEmptyBox, toList } from 'ghc/base/non-empty/list'
import { cons as listCons, ListBox, nil, toArray } from 'ghc/base/list/list'

const semigroup = createSemigroup<number>()

const createList = (value: number[]): ListBox<number> =>
    value.reduceRight((acc, curr) => listCons(curr)(acc), nil<number>())

const createNonEmptyList = (value: number[]): NonEmptyBox<number> =>
    compose<number[], ListBox<number>, NonEmptyBox<number>>(formList, createList)(value)

tap.test('NonEmptySemigroup', async (t) => {
    t.test('<>', async (t) => {
        const result = semigroup['<>'](createNonEmptyList([1, 2, 3]), createNonEmptyList([4, 5, 6]))

        t.same(toArray(toList(result)), [1, 2, 3, 4, 5, 6])
    })

    t.test('sconcat', async (t) => {
        const lists = [
            [1, 1],
            [2, 2],
            [3, 3],
        ].map(createNonEmptyList)

        const value = compose(
            cons(lists[0] as NonEmptyBox<number>),
            toList,
            cons(lists[1] as NonEmptyBox<number>),
            toList,
            cons(lists[2] as NonEmptyBox<number>),
        )(nil())

        const result = semigroup.sconcat(value)
        t.same(toArray(toList(result)), [1, 1, 2, 2, 3, 3])
    })

    t.test('stimes', async (t) => {
        const list = createNonEmptyList([1, 2, 3])

        const result1 = semigroup.stimes(3, list)
        const result2 = semigroup.stimes(0, list)
        const result3 = () => semigroup.stimes(-3, list)

        t.same(toArray(toList(result1)), [1, 2, 3, 1, 2, 3, 1, 2, 3])
        t.same(toArray(toList(result2)), [1, 2, 3])
        t.throws(result3)
    })

    t.test('semigroup law - associativity: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const list1 = createNonEmptyList([1, 2, 3])
        const list2 = createNonEmptyList([4, 5])
        const list3 = createNonEmptyList([6])

        const result3 = compose(
            (z: NonEmptyBox<number>) => semigroup['<>'](z, list3),
            (y: NonEmptyBox<number>) => semigroup['<>'](list1, y),
        )(list2)

        const result4 = compose(
            (z: NonEmptyBox<number>) => semigroup['<>'](list1, z),
            (y: NonEmptyBox<number>) => semigroup['<>'](list2, y),
        )(list3)

        t.same(toArray(toList(result3)), toArray(toList(result4)))
        t.same(toArray(toList(result3)), [1, 2, 3, 4, 5, 6])
    })
})
