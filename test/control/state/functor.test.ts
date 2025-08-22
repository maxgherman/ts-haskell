import tap from 'tap'
import { functor as createFunctor } from 'control/state/functor'
import { state, StateBox } from 'control/state/state'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

const functor = createFunctor<number>()
const run = <A>(sa: StateBox<number, A>, s: number) => sa.runState(s)

tap.test('State functor', async (t) => {
    const value = state((s: number) => tuple2(s, s + 1))

    const mapped = functor.fmap((x: number) => x + 1, value)
    const result1 = run(mapped, 1)
    t.equal(fst(result1), 2)
    t.equal(snd(result1), 2)

    const mapped2 = functor['<$>']((x: number) => x * 2, value)
    const result2 = run(mapped2, 2)
    t.equal(fst(result2), 4)
    t.equal(snd(result2), 3)

    const left = functor['<$'](5, value)
    const result3 = run(left, 3)
    t.equal(fst(result3), 5)
    t.equal(snd(result3), 4)

    const right = functor['$>'](value, 7)
    const result4 = run(right, 4)
    t.equal(fst(result4), 7)
    t.equal(snd(result4), 5)

    const fl = functor['<&>'](value, (x: number) => x - 1)
    const result5 = run(fl, 5)
    t.equal(fst(result5), 4)
    t.equal(snd(result5), 6)

    const voided = functor.void(value)
    const result6 = run(voided, 6)
    t.same(fst(result6), [])
    t.equal(snd(result6), 7)
})
