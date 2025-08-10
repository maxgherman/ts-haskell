import tap from 'tap'
import { curry } from 'ghc/base/tuple/tuple'

tap.test('curry', async (t) => {
    const add = (x: number, y: number): number => x + y
    const curriedAdd = curry(add)

    t.equal(curriedAdd(1)(2), 3)
    t.equal(add(1, 2), 3)
})
