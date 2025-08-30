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

    t.test('extend derives from duplicate', async (t) => {
        const f = (r: typeof ra) => cm.extract(r) + 1
        const viaExtend = cm.extend(f, ra)
        const viaDuplicate = cm.fmap(f, cm.duplicate(ra))
        t.equal(cm.extract(viaExtend), cm.extract(viaDuplicate))
    })

    t.test('liftW', async (t) => {
        const f = (x: number) => x + 1
        const viaLiftW = cm.liftW(f, ra)
        const viaExtend = cm.extend((w) => f(cm.extract(w)), ra)
        t.equal(cm.extract(viaLiftW), cm.extract(viaExtend))
    })

    t.test('(=>>)', async (t) => {
        const f = (r: typeof ra) => cm.extract(r) + 1
        const left = cm['=>>'](ra, f)
        const right = cm.extend(f, ra)
        t.equal(cm.extract(left), cm.extract(right))
    })

    t.test('(<<=)', async (t) => {
        const f = (r: typeof ra) => cm.extract(r) + 1
        const left = cm['<<='](f, ra)
        const right = cm.extend(f, ra)
        t.equal(cm.extract(left), cm.extract(right))
    })

    t.test('(=<=)', async (t) => {
        const f = (w: typeof ra) => cm.extract(w) + 1
        const g = (w: typeof ra) => cm.extract(w) * 2
        const left = cm['=<='](f, g, ra)
        const right = f(cm.extend(g, ra))
        t.equal(left, right)
    })

    t.test('(=>=)', async (t) => {
        const f = (w: typeof ra) => cm.extract(w) + 1
        const g = (w: typeof ra) => cm.extract(w) * 2
        const left = cm['=>='](f, g, ra)
        const right = g(cm.extend(f, ra))
        t.equal(left, right)
    })

    t.test('wfix', async (t) => {
        const w = reader((_: void) => (_: typeof ra) => 5)
        t.equal(cm.wfix<number>(w), 5)
    })

    t.test('cfix', async (t) => {
        const f = (_: typeof ra) => 7
        const result = cm.cfix<number>(f)
        t.equal(cm.extract(result), 7)
    })
})
