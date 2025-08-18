import tap from 'tap'
import { comonad } from 'control/reader/comonad'
import { reader } from 'control/reader/reader'

const cm = comonad<void>()

tap.test('Reader Comonad', async (t) => {
    const ra = reader((_: void) => 1)

    t.test('extract', async (t) => {
        t.equal(cm.extract(ra), 1)
    })

    t.test('extend', async (t) => {
        const f = (r: typeof ra) => cm.extract(r) + 1
        const extended = cm.extend(f, ra)
        t.equal(cm.extract(extended), 2)
    })

    t.test('duplicate', async (t) => {
        const duplicated = cm.duplicate(ra)
        t.equal(cm.extract(cm.extract(duplicated)), 1)

        const extended = cm.extend((w) => w, ra)
        t.equal(cm.extract(cm.extract(extended)), 1)
    })
})
