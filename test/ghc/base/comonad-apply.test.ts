import tap from 'tap'
import { comonad as writerComonad } from 'control/writer/comonad'
import { comonadApply as writerComonadApply } from 'control/writer/comonad-apply'
import { writer, WriterBox } from 'control/writer/writer'
import { comonadApply as createComonadApply } from 'control/comonad-apply'
import { tuple2 } from 'ghc/base/tuple/tuple'
import { id } from 'ghc/base/functions'

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

    t.test('derives liftW2 from <@>', async (t) => {
        const cm = writerComonad<string>()
        const base = {
            '<@>': <A, B>(wf: WriterBox<string, (a: A) => B>, wa: WriterBox<string, A>): WriterBox<string, B> =>
                writer(() => {
                    const [f, w] = wf.runWriter()
                    const [a] = wa.runWriter()
                    return tuple2(f(a), w)
                }),
        }
        const derived = createComonadApply(base as any, cm as any) as any

        const f = (x: number) => (y: number) => x + y
        const a = writer(() => tuple2(1, 'a'))
        const b = writer(() => tuple2(2, 'b'))
        const left = derived.liftW2(f, a, b)
        const right = derived['<@>'](derived['<$>'](f, a), b)
        t.same(run(left), run(right))
    })

    t.test('derives <@> from liftW2', async (t) => {
        const cm = writerComonad<string>()
        const base = {
            liftW2: <A, B, C>(
                f: (a: A) => (b: B) => C,
                wa: WriterBox<string, A>,
                wb: WriterBox<string, B>,
            ): WriterBox<string, C> =>
                writer(() => {
                    const [a, w] = wa.runWriter()
                    const [b] = wb.runWriter()
                    return tuple2(f(a)(b), w)
                }),
        }
        const derived = createComonadApply(base as any, cm as any) as any

        const wf = writer(() => tuple2((x: number) => x + 1, 'f'))
        const wa = writer(() => tuple2(1, 'a'))

        const left = derived['<@>'](wf, wa)
        const right = derived.liftW2(id as any, wf, wa)
        t.same(run(left), run(right))
    })
})
