import tap from 'tap'
import { curry, fst, snd, tuple2, unit } from 'ghc/base/tuple/tuple'

tap.test('curry', async (t) => {
    const add = (x: number, y: number): number => x + y
    const curriedAdd = curry(add)

    t.equal(curriedAdd(1)(2), 3)
    t.equal(add(1, 2), 3)
})

tap.test('fst and snd', async (t) => {
    const tuple = tuple2(1, 'a')

    t.equal(fst(tuple), 1)
    t.equal(snd(tuple), 'a')

    t.equal(fst([2, 'b']), 2)
    t.equal(snd([2, 'b']), 'b')
})

tap.test('unit', async (t) => {
    const u = unit()

    t.same([...u], [])
    t.equal(u.kind, '*')
})

tap.test('tuple2', async (t) => {
    const t2 = tuple2(1, 'a')

    t.equal(t2[0], 1)
    t.equal(t2[1], 'a')
    t.equal(t2.kind('*')('*'), '*')
})
