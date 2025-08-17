import tap from 'tap'
import { comonadApply as writerComonadApply } from 'control/writer/comonad-apply'
import { writer, WriterBox } from 'control/writer/writer'
import { tuple2 } from 'ghc/base/tuple/tuple'

const ca = writerComonadApply<string>()

const run = <A>(wa: WriterBox<string, A>): [A, string] => wa.runWriter()

tap.test('ComonadApply', async (t) => {
    t.test('liftW2 f a b = f <$> a <@> b', async (t) => {
        const f = (x: number) => (y: number) => x + y
        const a = writer(() => tuple2(1, 'a'))
        const b = writer(() => tuple2(2, 'b'))

        const left = ca.liftW2(f, a, b)
        const right = ca['<@>'](ca['<$>'](f, a), b)

        t.same(run(left), run(right))
    })
})
