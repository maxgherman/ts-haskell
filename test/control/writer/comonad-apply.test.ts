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
})
