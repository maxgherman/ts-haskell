import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { monoid } from 'ghc/base/tuple/unit-monoid'
import { unit } from 'ghc/base/tuple/tuple'
import { cons, nil } from 'ghc/base/list/list'

tap.test('Unit monoid', async (t) => {
    t.test('mempty', async (t) => {
        t.same(monoid.mempty, [])
    })

    t.test('<>', async (t) => {
        const result = monoid['<>'](unit(), unit())
        t.same(result, [])
    })

    t.test('mappend', async (t) => {
        const result = monoid.mappend(unit(), unit())
        t.same(result, [])
    })

    t.test('mconcat', async (t) => {
        const list = compose(cons(unit()), cons(unit()), cons(unit()))(nil())

        const result1 = monoid.mconcat(nil())
        const result2 = monoid.mconcat(list)

        t.same(result1, [])
        t.same(result2, [])
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const result1 = monoid['<>'](monoid['<>'](unit(), unit()), unit())
        const result2 = monoid['<>'](unit(), monoid['<>'](unit(), unit()))

        const result3 = monoid.mappend(monoid.mappend(unit(), unit()), unit())
        const result4 = monoid.mappend(unit(), monoid.mappend(unit(), unit()))

        t.same(result1, result2)
        t.same(result1, [])

        t.same(result3, result4)
        t.same(result3, [])
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const result = monoid['<>'](monoid.mempty, unit())
        t.same(result, unit())
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const result = monoid['<>'](unit(), monoid.mempty)
        t.same(result, unit())
    })
})
