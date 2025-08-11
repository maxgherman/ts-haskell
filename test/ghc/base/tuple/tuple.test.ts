import tap from 'tap'
import { curry, fst, snd, tuple2, unit } from 'ghc/base/tuple/tuple'

tap.test('tuple utilities', async (t) => {
    const add = (x: number, y: number): number => x + y
    const curriedAdd = curry(add)
    const tpl = tuple2(1, 2)

    t.equal(curriedAdd(1)(2), 3)
    t.equal(add(1, 2), 3)
    t.equal(fst(tpl), 1)
    t.equal(snd(tpl), 2)
    t.equal(tpl.kind('*')('*'), '*')
    t.equal(unit().kind, '*')
})
