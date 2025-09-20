import tap from 'tap'
import { rws, runRWS, evalRWS, execRWS } from 'control/rws/rws'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { applicative as rwsApplicative } from 'control/rws/applicative'
import { monad as rwsMonad } from 'control/rws/monad'

const wMonoid = listMonoid<string>()
const appendLog = (message: string): ListBox<string> => cons(message)(nil<string>())

const baseAction = rws<number, ListBox<string>, number, number>((env, state) => {
    const newState = state + 1
    const value = env + state
    const log = appendLog(`env:${env}`)
    return tuple2(tuple2(value, newState), log)
})

tap.test('runRWS exposes value, state, and log', (t) => {
    const result = runRWS(baseAction, 3, 4)
    t.equal(fst(fst(result)), 7)
    t.equal(snd(fst(result)), 5)
    t.same(toArray(snd(result)), ['env:3'])
    t.end()
})

tap.test('evalRWS returns value component', (t) => {
    t.equal(evalRWS(baseAction, 2, 10), 12)
    t.end()
})

tap.test('execRWS returns state and writer output', (t) => {
    const exec = execRWS(baseAction, 5, 1)
    t.equal(fst(exec), 2)
    t.same(toArray(snd(exec)), ['env:5'])
    t.end()
})

const app = rwsApplicative<number, ListBox<string>, number>(wMonoid)
const monad = rwsMonad<number, ListBox<string>, number>(wMonoid)

tap.test('pure injects value without changing state/log', (t) => {
    const pureAction = app.pure(99)
    const result = runRWS(pureAction, 0, 3)
    t.equal(fst(fst(result)), 99)
    t.equal(snd(fst(result)), 3)
    t.same(toArray(snd(result)), [])
    t.end()
})

tap.test('RWS kind annotation reports expected shape', (t) => {
    const action = rws<number, ListBox<string>, number, string>((env, state) =>
        tuple2(tuple2(`${env}:${state}`, state), nil<string>()),
    )

    const kindFn = (
        action as unknown as {
            kind: (_: '*') => (_: '*') => (_: '*') => string
        }
    ).kind

    const first = kindFn('*')
    const second = first('*')
    const final = second('*')

    t.equal(final, '*')
    t.end()
})

tap.test('RWS example with numeric environment and state', (t) => {
    const program = monad['>>='](baseAction, (x: number) =>
        monad['>>='](baseAction, (y: number) => monad.return(x + y)),
    )

    const result = runRWS(program, 4, 2)
    const valueState = fst(result)
    t.equal(fst(valueState), 4 + 2 + (4 + 3))
    t.equal(snd(valueState), 4)
    t.same(toArray(snd(result)), ['env:4', 'env:4'])
    t.end()
})
