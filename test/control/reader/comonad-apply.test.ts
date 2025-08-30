import tap from 'tap'
import { comonadApply } from 'control/reader/comonad-apply'
import { reader } from 'control/reader/reader'
import type { ReaderBox } from 'control/reader/reader'

const ca = comonadApply<void>()

tap.test('Reader ComonadApply', async (t) => {
    t.test('<@>', async (t) => {
        const wf = reader((_: void) => (x: number) => x + 1)
        const wa = reader((_: void) => 1)
        const result = ca['<@>'](wf, wa)
        t.equal(ca.extract(result), 2)
    })

    t.test('<@@>', async (t) => {
        const wa = reader((_: void) => 1)
        const wf = reader((_: void) => (x: number) => x + 1)
        const result = ca['<@@>'](wa, wf)
        t.equal(ca.extract(result), 2)
    })

    t.test('liftW2', async (t) => {
        const wa = reader((_: void) => 1)
        const wb = reader((_: void) => 2)
        const result = ca.liftW2((a: number) => (b: number) => a + b, wa, wb)
        t.equal(ca.extract(result), 3)
    })

    t.test('liftW3', async (t) => {
        const wa = reader((_: void) => 1)
        const wb = reader((_: void) => 2)
        const wc = reader((_: void) => 3)
        const result = ca.liftW3((a: number) => (b: number) => (c: number) => a + b + c, wa, wb, wc)
        t.equal(ca.extract(result), 6)
    })

    t.test('liftW2 f a b = f <$> a <@> b', async (t) => {
        const f = (x: number) => (y: number) => x + y
        const a = reader((_: void) => 1)
        const b = reader((_: void) => 2)
        const left = ca.liftW2(f, a, b)
        const right = ca['<@>'](ca['<$>'](f, a), b)
        t.equal(ca.extract(left), ca.extract(right))
    })

    t.test('liftW3 f a b c = f <$> a <@> b <@> c', async (t) => {
        const f = (x: number) => (y: number) => (z: number) => x + y + z
        const a = reader((_: void) => 1)
        const b = reader((_: void) => 2)
        const c = reader((_: void) => 3)
        const left = ca.liftW3(f, a, b, c)
        const right = ca['<@>'](ca['<@>'](ca['<$>'](f, a), b), c)
        t.equal(ca.extract(left), ca.extract(right))
    })

    t.test('derives <@> from liftW2', async (t) => {
        const wf = reader((_: void) => (x: number) => x + 1)
        const wa = reader((_: void) => 1)
        const left = ca['<@>'](wf, wa)
        const right = ca.liftW2((f: (a: number) => number) => (a: number) => f(a), wf, wa)
        t.equal(ca.extract(left), ca.extract(right))
    })

    t.test('kfix', async (t) => {
        const w = reader((_: void) => (_: ReaderBox<void, number>) => 5)
        const result = ca.kfix<number>(w)
        const verify = ca['<@>'](w, ca.duplicate(result))
        t.equal(ca.extract(result), ca.extract(verify))
    })
})
