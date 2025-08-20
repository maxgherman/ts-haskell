import tap from 'tap'
import { kindOf, Traversable } from 'ghc/base/traversable'

tap.test('traversable', async () => {
    tap.test('kindOf', async (t) => {
        const kind = kindOf({} as Traversable) as Function
        const result = kind({} as (_: '*') => '*')
        t.equal(result, 'Constraint')
    })
})
