import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { semigroup } from 'ghc/base/tuple/unit-semigroup'
import { unit } from 'ghc/base/tuple/tuple'
import { fromList } from 'ghc/base/non-empty/list'
import { cons, nil } from 'ghc/base/list/list'

tap.test('Unit semigroup', async (t) => {
    t.test('<>', async (t) => {
        const result = semigroup['<>'](unit(), unit())
        t.same(result, [])
    })

    t.test('sconcat', async (t) => {
        const data1 = compose(fromList, cons(unit()), cons(unit()))(nil())
        const data2 = compose(fromList, cons(unit()))(nil())
        const result1 = semigroup.sconcat(data1)
        const result2 = semigroup.sconcat(data2)

        t.same(result1, [])
        t.same(result2, [])
    })

    t.test('stimes', async (t) => {
        const result1 = semigroup.stimes(10, unit())
        const result2 = semigroup.stimes(0, unit())
        const result3 = () => semigroup.stimes(-1, unit())

        t.same(result1, [])
        t.same(result2, [])
        t.throws(result3)
    })

    t.test('semigroup law - associativity: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const result1 = semigroup['<>'](semigroup['<>'](unit(), unit()), unit())
        const result2 = semigroup['<>'](unit(), semigroup['<>'](unit(), unit()))

        t.same(result1, result2)
        t.same(result1, [])
    })
})
