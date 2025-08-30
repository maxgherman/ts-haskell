import tap from 'tap'
import { kindOf, Semigroup } from 'ghc/base/semigroup'

tap.test('semigroup', async () => {
    tap.test('kindOf', async (t) => {
        const result = kindOf({} as unknown as Semigroup<unknown>) as (_: '*') => 'Constraint'

        t.equal(result('*'), 'Constraint')
    })
})
