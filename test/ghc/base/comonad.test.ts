import tap from 'tap'
import { comonad as writerComonad } from 'control/writer/comonad'
import { functor as writerFunctor } from 'control/writer/functor'
import { writer, WriterBox } from 'control/writer/writer'
import { comonad as createComonad, BaseImplementation } from 'control/comonad'
import type { WriterComonad } from 'control/writer/comonad'
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

    t.test('derives duplicate from extend', async (t) => {
        const functor = writerFunctor<string>()
        const base = {
            extract: <A>(wb: WriterBox<string, A>): A => wb.runWriter()[0],
            extend: <A, B>(f: (wb: WriterBox<string, A>) => B, wb: WriterBox<string, A>): WriterBox<string, B> =>
                writer(() => {
                    const [, w] = wb.runWriter()
                    return tuple2(f(wb), w)
                }),
        }
        const derived = createComonad(base as BaseImplementation, functor) as unknown as WriterComonad<string>

        const dup = derived.duplicate(wa)
        const ext = derived.extend((w: WriterBox<string, number>) => w, wa)
        t.same(run(dup), run(ext))
    })

    t.test('derives extend from duplicate', async (t) => {
        const functor = writerFunctor<string>()
        const base = {
            extract: <A>(wb: WriterBox<string, A>): A => wb.runWriter()[0],
            duplicate: <A>(wb: WriterBox<string, A>): WriterBox<string, WriterBox<string, A>> =>
                writer(() => {
                    const [, w] = wb.runWriter()
                    return tuple2(wb, w)
                }),
        }
        const derived = createComonad(base as BaseImplementation, functor) as unknown as WriterComonad<string>

        const f = (w: WriterBox<string, number>) => w.runWriter()[0] + 1
        const left = derived.extend(f, wa)
        const right = derived['<$>'](f, derived.duplicate(wa))
        t.same(run(left), run(right))
    })
})
