import tap from 'tap'
import { apply } from 'control/state/apply'
import { state, runState, StateBox } from 'control/state/state'
import { tuple2 } from 'ghc/base/tuple/tuple'

tap.test('State Apply', async (t) => {
    const A = apply<number>()

    const sf = state<number, (x: number) => number>((s) => tuple2((x: number) => x + s, s + 1))
    const sa = state<number, number>((s) => tuple2(s * 2, s + 1))

    const r = A['<*>'](sf, sa) as StateBox<number, number>
    const [v, s] = runState(r as StateBox<number, number>, 3)
    t.equal(v, 11)
    t.equal(s, 5)

    const rThen = A['*>'](
        sa,
        state<number, number>((s: number) => tuple2(s + 10, s + 1)),
    )
    const [v2, s2] = runState(rThen as StateBox<number, number>, 1)
    t.equal(v2, 12)
    t.equal(s2, 3)

    const rLeft = A['<*'](
        sa,
        state<number, number>((s: number) => tuple2(s + 10, s + 1)),
    )
    const [v3, s3] = runState(rLeft as StateBox<number, number>, 1)
    t.equal(v3, 2)
    t.equal(s3, 3)

    const rFlip = A['<**>'](sa, sf)
    const [v4] = runState(rFlip as StateBox<number, number>, 2)
    t.equal(v4, 7)
})
