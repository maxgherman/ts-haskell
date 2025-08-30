import tap from 'tap'
import { alternative as listAlternative } from 'ghc/base/list/alternative'
import { cons, nil, toArray, take, ListBox } from 'ghc/base/list/list'

const alternative = listAlternative<number>()

const listOf = (...xs: number[]): ListBox<number> => xs.reduceRight((acc, x) => cons(x)(acc), nil<number>())

tap.test('Alternative', async (t) => {
    await t.test('empty', async (t) => {
        const result = alternative.empty()
        t.same(toArray(result), [])
    })

    await t.test('<|>', async (t) => {
        const a = listOf(1, 2)
        const b = listOf(3)
        const result = alternative['<|>'](a, b)
        t.same(toArray(result), [1, 2, 3])
    })

    await t.test('some', async (t) => {
        const value = listOf(1, 2)
        const result = alternative.some(value)
        t.equal((result as unknown as { kind: (_: '*') => '*' }).kind('*'), '*')
        const first4 = toArray(take(4, result)).map((lst) => toArray(lst))
        t.same(first4, [[1], [2], [1, 1], [1, 2]])
    })

    await t.test('many', async (t) => {
        const emptyRes = alternative.many(nil<number>())
        t.same(toArray(emptyRes).map(toArray), [[]])

        const value = listOf(1, 2)
        const first4 = toArray(take(4, alternative.many(value))).map((lst) => toArray(lst))
        t.same(first4, [[1], [2], [1, 1], [1, 2]])
    })
})
