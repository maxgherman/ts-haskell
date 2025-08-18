import tap from 'tap'
import { comonadApply } from 'control/reader/comonad-apply'
import { reader } from 'control/reader/reader'

const ca = comonadApply<void>()

tap.test('Reader ComonadApply', async (t) => {
    t.test('<@>', async (t) => {
        const wf = reader((_: void) => (x: number) => x + 1)
        const wa = reader((_: void) => 1)
        const result = ca['<@>'](wf, wa)
        t.equal(ca.extract(result), 2)
    })

    t.test('liftW2', async (t) => {
        const wa = reader((_: void) => 1)
        const wb = reader((_: void) => 2)
        const result = ca.liftW2((a: number) => (b: number) => a + b, wa, wb)
        t.equal(ca.extract(result), 3)
    })
})
