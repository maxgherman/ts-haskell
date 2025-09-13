import tap from 'tap'
import { kindOf, Foldable1 } from 'data/semigroup/foldable'

tap.test('Foldable1 kindOf', async (t) => {
    const kind = kindOf({} as Foldable1) as (_: (_: '*') => '*') => 'Constraint'
    const res = kind((_: '*') => '*')
    t.equal(res, 'Constraint')
})
