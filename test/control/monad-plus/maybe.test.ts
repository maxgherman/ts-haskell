import tap from 'tap'
import { monadPlus as maybeMonadPlus } from 'control/monad-plus/maybe'
import { guard } from 'control/monad-plus/monad-plus'
import { just, nothing, MaybeBox, $case } from 'ghc/base/maybe/maybe'
import { cons, nil } from 'ghc/base/list/list'

const getValue = <A>(box: MaybeBox<A>): A | undefined =>
    $case<A, A | undefined>({
        just: (x) => x,
        nothing: () => undefined,
    })(box)

tap.test('Maybe MonadPlus', async (t) => {
    await t.test('mzero', async (t) => {
        const result = maybeMonadPlus.mzero<number>()
        t.equal(getValue(result), undefined)
    })

    await t.test('mplus', async (t) => {
        const result1 = maybeMonadPlus.mplus(just(1), just(2))
        const result2 = maybeMonadPlus.mplus(nothing<number>(), just(2))
        const result3 = maybeMonadPlus.mplus(nothing<number>(), nothing<number>())

        t.equal(getValue(result1), 1)
        t.equal(getValue(result2), 2)
        t.equal(getValue(result3), undefined)
    })

    await t.test('msum', async (t) => {
        const list = cons(nothing<number>())(cons(just(3))(cons(just(4))(nil())))
        const result = maybeMonadPlus.msum(list)
        t.equal(getValue(result), 3)

        const emptyResult = maybeMonadPlus.msum(nil<MaybeBox<number>>())
        t.equal(getValue(emptyResult), undefined)
    })

    await t.test('guard', async (t) => {
        const result1 = guard(maybeMonadPlus)(true) as unknown as MaybeBox<[]>
        const result2 = guard(maybeMonadPlus)(false) as unknown as MaybeBox<[]>

        t.same(getValue(result1), [])
        t.equal(getValue(result2), undefined)
    })
})
