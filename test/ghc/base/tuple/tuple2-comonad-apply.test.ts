import tap from 'tap'
import { comonadApply } from 'ghc/base/tuple/tuple2-comonad-apply'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

const ca = comonadApply<string>()

tap.test('Tuple2 ComonadApply', async (t) => {
    t.test('<@>', async (t) => {
        const wf = tuple2('ctxf', (x: number) => x + 1)
        const wa = tuple2('ctxa', 1)
        const result = ca['<@>'](wf, wa)
        t.equal(fst(result), 'ctxf')
        t.equal(snd(result), 2)
    })

    t.test('liftW2', async (t) => {
        const wa = tuple2('ctx', 1)
        const wb = tuple2('ctx2', 2)
        const result = ca.liftW2((a: number) => (b: number) => a + b, wa, wb)
        t.equal(fst(result), 'ctx')
        t.equal(snd(result), 3)
    })
})
