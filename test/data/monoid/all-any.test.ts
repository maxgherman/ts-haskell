import tap from 'tap'
import { all, getAll, semigroup as allSemigroup, monoid as allMonoid } from 'data/monoid/all'
import { any, getAny, semigroup as anySemigroup, monoid as anyMonoid } from 'data/monoid/any'
type Star = '*' & ((_: '*') => '*')
const star = '*' as Star

tap.test('All monoid', async (t) => {
    const s = allSemigroup()
    const m = allMonoid()

    t.equal(getAll(s['<>'](all(true), all(false)) as unknown as ReturnType<typeof all>), false)
    t.equal(getAll(m['<>'](all(true), m.mempty) as unknown as ReturnType<typeof all>), true)
    t.equal(getAll(m['<>'](m.mempty, all(false)) as unknown as ReturnType<typeof all>), false)
})

tap.test('Any monoid', async (t) => {
    const s = anySemigroup()
    const m = anyMonoid()

    t.equal(getAny(s['<>'](any(true), any(false)) as unknown as ReturnType<typeof any>), true)
    t.equal(getAny(m['<>'](any(false), m.mempty) as unknown as ReturnType<typeof any>), false)
    t.equal(getAny(m['<>'](m.mempty, any(true)) as unknown as ReturnType<typeof any>), true)
    // kind
    t.equal(all(true).kind(star), '*')
    t.equal(any(false).kind(star), '*')
})
