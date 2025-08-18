import tap from 'tap'
import { comonad } from 'ghc/base/tuple/tuple2-comonad'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

const cm = comonad<string>()

tap.test('Tuple2 Comonad', async (t) => {
    const ta = tuple2('ctx', 1)

    t.test('extract', async (t) => {
        t.equal(cm.extract(ta), 1)
    })

    t.test('extend', async (t) => {
        const f = (x: typeof ta) => cm.extract(x) + 1
        const extended = cm.extend(f, ta)
        t.equal(fst(extended), 'ctx')
        t.equal(snd(extended), 2)
    })

    t.test('duplicate', async (t) => {
        const dup = cm.duplicate(ta)
        t.equal(fst(dup), 'ctx')
        t.same(snd(dup), ta)
    })
})
