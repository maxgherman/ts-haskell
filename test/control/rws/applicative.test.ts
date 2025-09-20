import tap from 'tap'
import { applicative as rwsApplicative } from 'control/rws/applicative'
import { rws, runRWS } from 'control/rws/rws'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { monoid as listMonoid } from 'ghc/base/list/monoid'

const wMonoid = listMonoid<string>()
const appendLog = (message: string): ListBox<string> => cons(message)(nil<string>())
const App = rwsApplicative<number, ListBox<string>, number>(wMonoid)

const valueAction = rws<number, ListBox<string>, number, number>((env, state) =>
    tuple2(tuple2(env + state, state + 1), appendLog('value')),
)

const functionAction = rws<number, ListBox<string>, number, (x: number) => string>((env, state) =>
    tuple2(
        tuple2((x: number) => `${env}:${x}`, state + 2),
        appendLog('func'),
    ),
)

tap.test('RWS Applicative <*> applies function and accumulates state/log', (t) => {
    const result = runRWS(App['<*>'](functionAction, valueAction), 5, 1)
    const valueState = fst(result)
    t.equal(fst(valueState), '5:8')
    t.equal(snd(valueState), 4)
    t.same(toArray(snd(result)), ['func', 'value'])
    t.end()
})

tap.test('RWS Applicative liftA2 combines values and logs', (t) => {
    const otherAction = rws<number, ListBox<string>, number, number>((env, state) =>
        tuple2(tuple2(state, state + 3), appendLog(`state:${state}`)),
    )

    const result = runRWS(
        App.liftA2((x: number) => (y: number) => x - y, valueAction, otherAction),
        2,
        10,
    )

    const valueState = fst(result)
    t.equal(fst(valueState), 2 + 10 - 11)
    t.equal(snd(valueState), 14)
    t.same(toArray(snd(result)), ['value', 'state:11'])
    t.end()
})
