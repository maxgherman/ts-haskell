import tap from 'tap'
import { kindOf, Semigroup } from 'ghc/base/semigroup'

tap.test('semigroup', async () => {

    tap.test('kinOf', async (t) => {
        const result = kindOf({} as unknown as Semigroup<unknown>) as Function
        
        t.equal(result('*'), 'Constraint');
    })
})
