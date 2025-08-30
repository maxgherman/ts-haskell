import tap from 'tap'
import { kindOf, Functor } from 'ghc/base/functor'

tap.test('functor', async () => {
    tap.test('kindOf', async (t) => {
        const kind = kindOf({} as Functor) as Function
        const result = kind({} as (_: '*') => '*')

        t.equal(result, 'Constraint')
    })
})
