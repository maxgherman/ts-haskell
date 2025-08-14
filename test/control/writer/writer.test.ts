import tap from 'tap'
import { writer, runWriter, execWriter, mapWriter, WriterBox } from 'control/writer/writer'
import { fst, snd, tuple2 } from 'ghc/base/tuple/tuple'

tap.test('writer and runWriter', async (t) => {
    const computation: WriterBox<string, number> = writer(() => tuple2(3, 'log'))

    const result = runWriter(computation)
    t.equal(fst(result), 3)
    t.equal(snd(result), 'log')
    t.equal(computation.kind('*')('*'), '*')
})

tap.test('execWriter extracts the written value', async (t) => {
    const computation = writer(() => tuple2(5, 'log'))
    t.equal(execWriter(computation), 'log')
})

tap.test('mapWriter maps the tuple result', async (t) => {
    const computation = writer(() => tuple2(2, 'log'))
    const mapped = mapWriter(([n, w]) => tuple2(n * 3, w + '!'), computation)
    const tuple = runWriter(mapped)
    t.equal(fst(tuple), 6)
    t.equal(snd(tuple), 'log!')
})
