import tap from 'tap'
import { monad as rwsMonad } from 'control/rws/monad'
import { rws, runRWS } from 'control/rws/rws'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { monoid as listMonoid } from 'ghc/base/list/monoid'

const wMonoid = listMonoid<string>()
const appendLog = (message: string): ListBox<string> => cons(message)(nil<string>())
const Monad = rwsMonad<number, ListBox<string>, number>(wMonoid)

const base = (label: string, delta: number) =>
    rws<number, ListBox<string>, number, number>((env, state) =>
        tuple2(tuple2(env + state, state + delta), appendLog(label)),
    )

tap.test('RWS Monad return injects value', (t) => {
    const action = Monad.return(42)
    const result = runRWS(action, 0, 5)
    t.equal(fst(fst(result)), 42)
    t.equal(snd(fst(result)), 5)
    t.same(toArray(snd(result)), [])
    t.end()
})

tap.test('RWS Monad bind sequences state and logs', (t) => {
    const program = Monad['>>='](base('first', 1), (x: number) =>
        Monad['>>='](base('second', 2), (y: number) => Monad.return(x * y)),
    )

    const result = runRWS(program, 3, 4)
    const valueState = fst(result)
    t.equal(fst(valueState), (3 + 4) * (3 + 5))
    t.equal(snd(valueState), 7)
    t.same(toArray(snd(result)), ['first', 'second'])
    t.end()
})

tap.test('RWS Monad >> discards left result but keeps effects', (t) => {
    const first = base('first', 1)
    const second = base('second', 0)
    const result = runRWS(Monad['>>'](first, second), 2, 0)
    t.equal(fst(fst(result)), 3)
    t.equal(snd(fst(result)), 1)
    t.same(toArray(snd(result)), ['first', 'second'])
    t.end()
})
