import tap from 'tap'
import { alternative } from 'ghc/base/maybe/alternative'
import { just, nothing, MaybeBox, $case } from 'ghc/base/maybe/maybe'
import { toArray, ListBox } from 'ghc/base/list/list'
import { id } from 'ghc/base/functions'

const getValue = <A>(box: MaybeBox<A>): A | undefined =>
    $case<A, A | undefined>({
        just: id,
        nothing: () => undefined,
    })(box)

const getList = <A>(box: MaybeBox<ListBox<A>>): A[] | undefined =>
    $case<ListBox<A>, A[] | undefined>({
        just: (xs) => toArray(xs),
        nothing: () => undefined,
    })(box)

tap.test('Maybe alternative', async (t) => {
    await t.test('empty', async (t) => {
        const result = alternative.empty<number>()
        t.equal(getValue(result), undefined)
    })

    await t.test('<|>', async (t) => {
        const a = just(1)
        const b = just(2)
        const c = nothing<number>()

        const r1 = alternative['<|>'](a, b)
        const r2 = alternative['<|>'](c, b)
        const r3 = alternative['<|>'](a, c)

        t.equal(getValue(r1), 1)
        t.equal(getValue(r2), 2)
        t.equal(getValue(r3), 1)
    })

    await t.test('some', async (t) => {
        const value = just(3)
        const nothingValue = nothing<number>()

        const r1 = alternative.some(value)
        const r2 = alternative.some(nothingValue)

        t.same(getList(r1), [3])
        t.equal(getList(r2), undefined)
    })

    await t.test('many', async (t) => {
        const value = just(4)
        const nothingValue = nothing<number>()

        const r1 = alternative.many(value)
        const r2 = alternative.many(nothingValue)

        t.same(getList(r1), [4])
        t.same(getList(r2), [])
    })
})
