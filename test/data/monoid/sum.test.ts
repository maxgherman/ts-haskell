import tap from 'tap'
import { sum, getSum, semigroup as sumSemigroup, monoid as sumMonoid } from 'data/monoid/sum'

type Star = '*' & ((_: '*') => '*')
const star = '*' as Star

tap.test('Sum monoid', async (t) => {
    const s = sumSemigroup()
    const m = sumMonoid()

    t.equal(getSum(s['<>'](sum(2), sum(3)) as unknown as ReturnType<typeof sum>), 5)
    t.equal(getSum(m['<>'](sum(1), m.mempty) as unknown as ReturnType<typeof sum>), 1)
    t.equal(getSum(m['<>'](m.mempty, sum(7)) as unknown as ReturnType<typeof sum>), 7)

    // kind
    t.equal(sum(0).kind(star), '*')
})
