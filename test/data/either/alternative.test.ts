import tap from 'tap'
import { alternative } from 'data/either/alternative'
import { left, right, $case, EitherBox } from 'data/either/either'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { cons, nil, ListBox, toArray } from 'ghc/base/list/list'

const getRight = <E, A>(box: EitherBox<E, A>): A | undefined =>
    $case<E, A, A | undefined>({
        left: () => undefined,
        right: (x) => x,
    })(box)

const getLeft = <E, A>(box: EitherBox<E, A>): E | undefined =>
    $case<E, A, E | undefined>({
        left: (e) => e,
        right: () => undefined,
    })(box)

tap.test('Either alternative', async (t) => {
    const monoid = listMonoid<string>()
    const alt = alternative<ListBox<string>>(monoid)

    await t.test('empty', async (t) => {
        const result = alt.empty<number>()
        t.same(toArray(getLeft(result) as ListBox<string>), [])
    })

    await t.test('<|>', async (t) => {
        const r1 = right<ListBox<string>, number>(1)
        const r2 = right<ListBox<string>, number>(2)
        const l1 = left<ListBox<string>, number>(cons('e1')(nil()))
        const l2 = left<ListBox<string>, number>(cons('e2')(nil()))

        const a = alt['<|>'](r1, r2)
        const b = alt['<|>'](l1, r2)
        const c = alt['<|>'](l1, l2)

        t.equal(getRight(a), 1)
        t.equal(getRight(b), 2)
        t.same(toArray(getLeft(c) as ListBox<string>), ['e1', 'e2'])
    })

    await t.test('some', async (t) => {
        const r = right<ListBox<string>, number>(3)
        const l = left<ListBox<string>, number>(cons('err')(nil()))

        const sr = alt.some(r)
        const sl = alt.some(l)

        t.same(toArray(getRight(sr) as ListBox<number>), [3])
        t.same(toArray(getLeft(sl) as ListBox<string>), ['err'])
    })

    await t.test('many', async (t) => {
        const r = right<ListBox<string>, number>(4)
        const l = left<ListBox<string>, number>(cons('err')(nil()))

        const mr = alt.many(r)
        const ml = alt.many(l)

        t.same(toArray(getRight(mr) as ListBox<number>), [4])
        t.same(toArray(getRight(ml) as ListBox<number>), [])
    })
})
