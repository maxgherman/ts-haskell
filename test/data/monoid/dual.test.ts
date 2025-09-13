import tap from 'tap'
import { dual, getDual, semigroup as dualSemigroup, monoid as dualMonoid } from 'data/monoid/dual'
import { semigroup as listSemigroup } from 'ghc/base/list/semigroup'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
type Star = '*' & ((_: '*') => '*')
const star = '*' as Star

tap.test('Dual monoid reverses order', async (t) => {
    const ls = listSemigroup<number>()
    const lm = listMonoid<number>()
    const s = dualSemigroup<ListBox<number>>(ls)
    const m = dualMonoid<ListBox<number>>(lm)

    const x = cons<number>(1)(nil<number>())
    const y = cons<number>(2)(nil<number>())

    const combined = s['<>'](dual(x), dual(y)) as unknown as ReturnType<typeof dual<ListBox<number>>>
    t.same(toArray(getDual(combined) as ListBox<number>), [2, 1])

    const withEmpty = m['<>'](dual(x), m.mempty) as unknown as ReturnType<typeof dual<ListBox<number>>>
    t.same(toArray(getDual(withEmpty) as ListBox<number>), [1])
    t.equal(dual(x).kind(star), '*')
})
