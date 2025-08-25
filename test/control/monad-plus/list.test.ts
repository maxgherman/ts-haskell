import tap from 'tap'
import { monadPlus as listMonadPlus } from 'control/monad-plus/list'
import { guard } from 'control/monad-plus/monad-plus'
import { cons, nil, toArray, ListBox, List } from 'ghc/base/list/list'

const listOf = (...xs: number[]): ListBox<number> =>
    xs.reduceRight((acc, x) => cons(x)(acc), nil<number>())

const listOfLists = (...xs: ListBox<number>[]): List<ListBox<number>> =>
    xs.reduceRight((acc, x) => cons(x)(acc), nil<ListBox<number>>())

tap.test('List MonadPlus', async (t) => {
    const mp = listMonadPlus<number>()

    await t.test('mzero', async (t) => {
        const result = mp.mzero<number>()
        t.same(toArray(result), [])
    })

    await t.test('mplus', async (t) => {
        const result = mp.mplus(listOf(1, 2), listOf(3))
        t.same(toArray(result), [1, 2, 3])
    })

    await t.test('msum', async (t) => {
        const lists = listOfLists(listOf(1), listOf(2, 3))
        const result = mp.msum(lists)
        t.same(toArray(result), [1, 2, 3])

        const empty = mp.msum(nil<ListBox<number>>())
        t.same(toArray(empty), [])
    })

    await t.test('guard', async (t) => {
        const result1 = guard(mp)(true) as unknown as ListBox<[]>
        const result2 = guard(mp)(false) as unknown as ListBox<[]>

        t.same(toArray(result1), [[]])
        t.same(toArray(result2), [])
    })
})

