import tap from 'tap'
import {
    state,
    runState,
    evalState,
    execState,
    mapState,
    withState,
    get,
    put,
    modify,
    gets,
    StateBox,
} from 'control/state/state'
import { fst, snd, tuple2 } from 'ghc/base/tuple/tuple'

tap.test('state and runState', async (t) => {
    const computation: StateBox<number, string> = state((s: number) => tuple2(s.toString(), s + 1))
    const result = runState(computation, 0)
    t.equal(fst(result), '0')
    t.equal(snd(result), 1)
    t.equal(computation.kind('*')('*'), '*')
})

tap.test('evalState returns the value', async (t) => {
    const computation = state((s: number) => tuple2(s * 2, s + 1))
    t.equal(evalState(computation, 2), 4)
})

tap.test('execState returns the final state', async (t) => {
    const computation = state((s: number) => tuple2(s * 2, s + 1))
    t.equal(execState(computation, 2), 3)
})

tap.test('mapState maps the tuple result', async (t) => {
    const computation = state((s: number) => tuple2(s, s + 1))
    const mapped = mapState(([a, s]) => tuple2(a + 1, s * 2), computation)
    const result = runState(mapped, 3)
    t.equal(fst(result), 4)
    t.equal(snd(result), 8)
})

tap.test('withState modifies the input state', async (t) => {
    const computation = state((s: number) => tuple2(s, s + 1))
    const modified = withState((s: number) => s * 2, computation)
    const result = runState(modified, 3)
    t.equal(fst(result), 6)
    t.equal(snd(result), 7)
})

tap.test('get returns the current state as the value', async (t) => {
    const computation = get<number>()
    const result = runState(computation, 5)
    t.equal(fst(result), 5)
    t.equal(snd(result), 5)
})

tap.test('put replaces the state and returns unit', async (t) => {
    const computation = put<number>(10)
    const result = runState(computation, 5)
    t.same(fst(result), [])
    t.equal(snd(result), 10)
})

tap.test('modify updates the state using a function', async (t) => {
    const computation = modify<number>((s) => s + 3)
    const result = runState(computation, 7)
    t.same(fst(result), [])
    t.equal(snd(result), 10)
})

tap.test('gets extracts a value from the state without modifying it', async (t) => {
    const computation = gets<number, number>((s) => s * 2)
    const result = runState(computation, 4)
    t.equal(fst(result), 8)
    t.equal(snd(result), 4)
})
