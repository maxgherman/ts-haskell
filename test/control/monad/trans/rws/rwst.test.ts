import tap from 'tap'
import { MinBox1 } from 'data/kind'
import { monad as promiseMonad } from 'extra/promise/monad'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'
import { functor as rwstFunctor } from 'control/monad/trans/rws/functor'
import { applicative as rwstApplicative } from 'control/monad/trans/rws/applicative'
import { monad as rwstMonad } from 'control/monad/trans/rws/monad'
import { rwst, runRWST, lift as liftRWST, RWSTResult } from 'control/monad/trans/rws/rwst-t'

const promiseM = promiseMonad
const wMonoid = listMonoid<string>()
const Functor = rwstFunctor<number, ListBox<string>, number>(promiseM)
const Applicative = rwstApplicative<number, ListBox<string>, number>(promiseM, wMonoid)
const Monad = rwstMonad<number, ListBox<string>, number>(promiseM, wMonoid)

const toPromise = <T>(value: MinBox1<T>): Promise<T> => value as unknown as Promise<T>

const appendLog = (message: string): ListBox<string> => cons(message)(nil<string>())

type Result = RWSTResult<ListBox<string>, number, number>

const makeResult = (value: number, state: number, log: ListBox<string>): Result => tuple2(tuple2(value, state), log)

const baseAction = (label: string, delta: number) =>
    rwst<number, ListBox<string>, number, number>((env, state) => {
        return promiseM.return(makeResult(env + state, state + delta, appendLog(label))) as MinBox1<Result>
    })

tap.test('RWST Functor maps over asynchronous computation', async (t) => {
    const action = baseAction('step', 1)
    const mapped = Functor.fmap((x: number) => x * 2, action)
    const result = (await toPromise<Result>(runRWST(mapped, 2, 3))) as Result
    const valueState = fst(result)
    t.equal(fst(valueState), (2 + 3) * 2)
    t.equal(snd(valueState), 4)
    t.same(toArray(snd(result)), ['step'])
})

tap.test('RWST Applicative runs <*> and accumulates logs', async (t) => {
    const fnAction = baseAction('fn', 2)
    const valAction = baseAction('val', 1)
    const applied = Applicative['<*>'](
        Functor.fmap((n: number) => (x: number) => `${n}:${x}`, fnAction),
        valAction,
    )
    const result = (await toPromise<Result>(runRWST(applied, 1, 0))) as Result
    const valueState = fst(result)
    t.equal(fst(valueState), `${1 + 0}:${1 + 2}`)
    t.equal(snd(valueState), 3)
    t.same(toArray(snd(result)), ['fn', 'val'])
})

tap.test('RWST Applicative pure injects value and preserves state', async (t) => {
    const pureAction = Applicative.pure('ready')
    const result = (await toPromise<Result>(runRWST(pureAction, 5, 9))) as Result
    const valueState = fst(result)
    t.equal(fst(valueState), 'ready')
    t.equal(snd(valueState), 9)
    t.same(toArray(snd(result)), [])
})

tap.test('RWST Applicative liftA2 threads state and accumulates logs', async (t) => {
    const combined = Applicative.liftA2(
        (x: number) => (y: number) => x + y,
        baseAction('left', 1),
        baseAction('right', 2),
    )

    const result = (await toPromise<Result>(runRWST(combined, 2, 3))) as Result
    const valueState = fst(result)
    t.equal(fst(valueState), 2 + 3 + (2 + 4))
    t.equal(snd(valueState), 6)
    t.same(toArray(snd(result)), ['left', 'right'])
})

tap.test('RWST Applicative sequencing operators', async (t) => {
    const left = baseAction('left', 1)
    const right = baseAction('right', 2)

    const keepRight = Applicative['*>'](left, right) as unknown as ReturnType<typeof baseAction>
    const keepLeft = Applicative['<*'](left, right) as unknown as ReturnType<typeof baseAction>
    const swap = Applicative['<**>'](
        left,
        Functor.fmap((x: number) => (n: number) => x - n, right),
    ) as unknown as ReturnType<typeof baseAction>

    const rightResult = (await toPromise<Result>(runRWST(keepRight, 0, 0))) as Result
    t.equal(fst(fst(rightResult)), 0 + 1)
    t.equal(snd(fst(rightResult)), 3)
    t.same(toArray(snd(rightResult)), ['left', 'right'])

    const leftResult = (await toPromise<Result>(runRWST(keepLeft, 0, 0))) as Result
    t.equal(fst(fst(leftResult)), 0 + 0)
    t.equal(snd(fst(leftResult)), 3)
    t.same(toArray(snd(leftResult)), ['left', 'right'])

    const swappedResult = (await toPromise<Result>(runRWST(swap, 0, 0))) as Result
    t.equal(fst(fst(swappedResult)), 1 - (0 + 0))
    t.equal(snd(fst(swappedResult)), 3)
    t.same(toArray(snd(swappedResult)), ['left', 'right'])
})

tap.test('RWST Monad binds sequentially across asynchronous steps', async (t) => {
    const program = Monad['>>='](baseAction('first', 1), (x: number) =>
        Monad['>>='](baseAction('second', 2), (y: number) => Monad.return(x + y)),
    )

    const result = (await toPromise<Result>(runRWST(program, 4, 5))) as Result
    const valueState = fst(result)
    t.equal(fst(valueState), 4 + 5 + (4 + 6))
    t.equal(snd(valueState), 8)
    t.same(toArray(snd(result)), ['first', 'second'])
})

tap.test('lift embeds base monad actions into RWST', async (t) => {
    const lift = liftRWST<number, ListBox<string>, number>(promiseM, wMonoid)
    const lifted = lift(promiseM.return(42) as MinBox1<number>)
    const result = (await toPromise<Result>(runRWST(lifted, 0, 7))) as Result
    const valueState = fst(result)
    t.equal(fst(valueState), 42)
    t.equal(snd(valueState), 7)
    t.same(toArray(snd(result)), [])
})

tap.test('RWST lift keeps kind annotation', (t) => {
    const lift = liftRWST<number, ListBox<string>, number>(promiseM, wMonoid)
    const lifted = lift(promiseM.return('x') as MinBox1<string>)
    const kindFn = (lifted as unknown as { kind: (_: '*') => '*' }).kind
    t.equal(kindFn('*'), '*')
    t.end()
})
