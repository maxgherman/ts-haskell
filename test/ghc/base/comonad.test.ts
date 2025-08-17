import tap from 'tap'
import { comonad as writerComonad } from 'control/writer/comonad'
import { writer, WriterBox } from 'control/writer/writer'
import { tuple2 } from 'ghc/base/tuple/tuple'

const cm = writerComonad<string>()

const run = <A>(wa: WriterBox<string, A>): [A, string] => wa.runWriter()

tap.test('Comonad', async (t) => {
    const wa = writer(() => tuple2(1, 'log'))

    t.test('duplicate = extend id', async (t) => {
        const dup = cm.duplicate(wa)
        const ext = cm.extend((x) => x, wa)
        t.same(run(dup), run(ext))
    })

    t.test('extend f = fmap f . duplicate', async (t) => {
        const f = (w: WriterBox<string, number>) => w.runWriter()[0] + 1
        const left = cm.extend(f, wa)
        const right = cm['<$>'](f, cm.duplicate(wa))
        t.same(run(left), run(right))
    })
})
