import tap from 'tap'
import { applicative as createApplicative } from 'control/state/applicative'
import { state, StateBox } from 'control/state/state'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

const applicative = createApplicative<number>()
const run = <A>(sa: StateBox<number, A>, s: number) => sa.runState(s)

tap.test('State applicative', async (t) => {
    const value1 = state((s: number) => tuple2(s + 1, s + 1))
    const value2 = state((s: number) => tuple2(s * 2, s + 1))

    const pureV = applicative.pure(3)
    const r0 = run(pureV, 0)
    t.equal(fst(r0), 3)
    t.equal(snd(r0), 0)

    const f = state((s: number) => tuple2((x: number) => x + 2, s + 1))
    const app = applicative['<*>'](f, value1)
    const r1 = run(app, 0)
    t.equal(fst(r1), 4)
    t.equal(snd(r1), 2)

    const lifted = applicative.liftA2((x: number) => (y: number) => x + y, value1, value2)
    const r2 = run(lifted, 1)
    t.equal(fst(r2), 6)
    t.equal(snd(r2), 3)

    const thenRight = applicative['*>'](value1, value2)
    const r3 = run(thenRight, 2)
    t.equal(fst(r3), 6)
    t.equal(snd(r3), 4)

    const thenLeft = applicative['<*'](value1, value2)
    const r4 = run(thenLeft, 2)
    t.equal(fst(r4), 3)
    t.equal(snd(r4), 4)

    const applyLeft = applicative['<**>'](value1, f)
    const r5 = run(applyLeft, 5)
    t.equal(fst(r5), 8)
    t.equal(snd(r5), 7)
})
