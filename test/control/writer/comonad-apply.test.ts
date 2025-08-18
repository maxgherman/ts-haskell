import tap from 'tap'
import { comonadApply } from 'control/writer/comonad-apply'
import { writer } from 'control/writer/writer'
import { tuple2 } from 'ghc/base/tuple/tuple'

const ca = comonadApply<string>()

tap.test('Writer ComonadApply', async (t) => {
    t.test('<@>', async (t) => {
        const wf = writer(() => tuple2((x: number) => x + 1, 'log'))
        const wa = writer(() => tuple2(1, 'v'))
        const result = ca['<@>'](wf, wa)
        t.equal(ca.extract(result), 2)
    })

    t.test('<@@>', async (t) => {
        const wa = writer(() => tuple2(1, 'v'))
        const wf = writer(() => tuple2((x: number) => x + 1, 'log'))
        const result = ca['<@@>'](wa, wf)
        t.equal(ca.extract(result), 2)
    })

    t.test('liftW3', async (t) => {
        const wa = writer(() => tuple2(1, 'a'))
        const wb = writer(() => tuple2(2, 'b'))
        const wc = writer(() => tuple2(3, 'c'))
        const result = ca.liftW3(
            (a: number) => (b: number) => (c: number) => a + b + c,
            wa,
            wb,
            wc,
        )
        t.equal(ca.extract(result), 6)
    })
})
