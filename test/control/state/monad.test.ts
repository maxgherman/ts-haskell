import tap from 'tap'
import { monad as createMonad } from 'control/state/monad'
import { state, StateBox } from 'control/state/state'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'
import { doNotation } from 'ghc/base/monad/do-notation'

const monad = createMonad<number>()
const run = <A>(sa: StateBox<number, A>, s: number) => sa.runState(s)

tap.test('State monad', async (t) => {
    const mreturn = monad.return(5)
    const r0 = run(mreturn, 0)
    t.equal(fst(r0), 5)
    t.equal(snd(r0), 0)

    const m = state((s: number) => tuple2(s + 1, s + 1))
    const bound = monad['>>='](m, (x: number) => state((s: number) => tuple2(x * 2, s + 1)))
    const r1 = run(bound, 1)
    t.equal(fst(r1), 4)
    t.equal(snd(r1), 3)

    const seq = monad['>>'](
        state((s: number) => tuple2('ignore', s + 1)),
        m,
    )
    const r2 = run(seq, 2)
    t.equal(fst(r2), 4)
    t.equal(snd(r2), 4)

    const result = doNotation<StateBox<number, number>>(function* (): Generator<
        StateBox<number, number>,
        number,
        number
    > {
        const a = (yield state((s: number) => tuple2(s, s + 1))) as number
        const b = (yield state((s: number) => tuple2(s * 2, s + 1))) as number
        return a + b
    }, monad)

    const r3 = run(result, 1)
    t.equal(fst(r3), 5)
    t.equal(snd(r3), 3)
})
