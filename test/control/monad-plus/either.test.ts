import tap from 'tap'
import { monadPlus as eitherMonadPlus } from 'control/monad-plus/either'
import { guard } from 'control/monad-plus/monad-plus'
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

tap.test('Either MonadPlus', async (t) => {
    const monoid = listMonoid<string>()
    const mp = eitherMonadPlus<ListBox<string>>(monoid)

    await t.test('mzero', async (t) => {
        const result = mp.mzero<number>()
        t.same(toArray(getLeft(result) as ListBox<string>), [])
    })

    await t.test('mplus', async (t) => {
        const r1 = right<ListBox<string>, number>(1)
        const r2 = right<ListBox<string>, number>(2)
        const l1 = left<ListBox<string>, number>(cons('e1')(nil()))
        const l2 = left<ListBox<string>, number>(cons('e2')(nil()))

        const a = mp.mplus(r1, r2)
        const b = mp.mplus(l1, r2)
        const c = mp.mplus(l1, l2)

        t.equal(getRight(a), 1)
        t.equal(getRight(b), 2)
        t.same(toArray(getLeft(c) as ListBox<string>), ['e1', 'e2'])
    })

    await t.test('msum', async (t) => {
        const l1 = left<ListBox<string>, number>(cons('e1')(nil()))
        const l2 = left<ListBox<string>, number>(cons('e2')(nil()))
        const r = right<ListBox<string>, number>(3)
        const list = cons(l1)(cons(l2)(cons(r)(nil())))
        const allLeft = cons(l1)(cons(l2)(nil()))

        const result = mp.msum(list)
        const resultLeft = mp.msum(allLeft)
        const empty = mp.msum(nil<EitherBox<ListBox<string>, number>>())

        t.equal(getRight(result), 3)
        t.same(toArray(getLeft(resultLeft) as ListBox<string>), ['e1', 'e2'])
        t.same(toArray(getLeft(empty) as ListBox<string>), [])
    })

    await t.test('guard', async (t) => {
        const ok = guard(mp)(true) as unknown as EitherBox<ListBox<string>, []>
        const bad = guard(mp)(false) as unknown as EitherBox<ListBox<string>, []>

        t.same(getRight(ok), [])
        t.same(toArray(getLeft(bad) as ListBox<string>), [])
    })
})

