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
        const viaLiftW = cm.liftW(f, ra) as any
        const viaExtend = cm.extend((w) => f(cm.extract(w)), ra)
        t.equal(cm.extract(viaLiftW as any), cm.extract(viaExtend))
    })

    t.test('(=>>)', async (t) => {
        const f = (r: typeof ra) => cm.extract(r) + 1
        const left = cm['=>>'](ra, f as any)
        const right = cm.extend(f as any, ra)
        t.equal(cm.extract(left as any), cm.extract(right as any))
    })

    t.test('(<<=)', async (t) => {
        const f = (r: typeof ra) => cm.extract(r) + 1
        const left = cm['<<='](f as any, ra)
        const right = cm.extend(f as any, ra)
        t.equal(cm.extract(left as any), cm.extract(right as any))
    })

    t.test('(=<=)', async (t) => {
        const f = (w: typeof ra) => cm.extract(w) + 1
        const g = (w: typeof ra) => cm.extract(w) * 2
        const left = cm['=<='](f as any, g as any, ra)
        const right = (f as any)(cm.extend(g as any, ra))
        t.equal(left, right)
    })

    t.test('(=>=)', async (t) => {
        const f = (w: typeof ra) => cm.extract(w) + 1
        const g = (w: typeof ra) => cm.extract(w) * 2
        const left = cm['=>='](f as any, g as any, ra)
        const right = (g as any)(cm.extend(f as any, ra))
        t.equal(left, right)
    })

    t.test('wfix', async (t) => {
        const w = reader((_: void) => (_: typeof ra) => 5)
        t.equal(cm.wfix(w as any), 5)
    })

    t.test('cfix', async (t) => {
        const f = (_: typeof ra) => 7
        const result = cm.cfix(f as any)
        t.equal(cm.extract(result as any), 7)
    })
})
