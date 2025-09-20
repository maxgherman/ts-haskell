import tap from 'tap'
import { functor as rwsFunctor } from 'control/rws/functor'
import { rws, runRWS } from 'control/rws/rws'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'

const appendLog = (message: string): ListBox<string> => cons(message)(nil<string>())

const fmap = rwsFunctor<number, ListBox<string>, number>()

const base = rws<number, ListBox<string>, number, number>((env, state) =>
    tuple2(tuple2(env * 2, state + 1), appendLog(`env:${env}`)),
)

tap.test('RWS Functor maps value without touching state/log', (t) => {
    const mapped = fmap.fmap((x: number) => x + 5, base)
    const result = runRWS(mapped, 4, 2)
    t.equal(fst(fst(result)), 13)
    t.equal(snd(fst(result)), 3)
    t.same(toArray(snd(result)), ['env:4'])
    t.end()
})
