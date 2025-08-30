import tap from 'tap'
import { kindOf, Bifunctor } from 'data/bifunctor'

tap.test('bifunctor kindOf', async () => {
    const kind = kindOf({} as Bifunctor) as (_: (_: '*') => (_: '*') => '*') => 'Constraint'
    const result = kind({} as (_: '*') => (_: '*') => '*')

    tap.equal(result, 'Constraint')
})
