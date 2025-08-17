import tap from 'tap'
import { comonad } from 'control/writer/comonad'
import { writer } from 'control/writer/writer'
import { tuple2 } from 'ghc/base/tuple/tuple'

const cm = comonad<string>()

tap.test('Writer Comonad', async (t) => {
    const wa = writer(() => tuple2(1, 'log'))

    t.test('extract', async (t) => {
        t.equal(cm.extract(wa), 1)
    })

    t.test('extend', async (t) => {
        const f = (w: typeof wa) => cm.extract(w) + 1
        const extended = cm.extend(f, wa)
        t.equal(cm.extract(extended), 2)
    })
})
