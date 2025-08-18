import { comonadApply as createComonadApply, ComonadApply, BaseImplementation } from 'ghc/base/comonad-apply'
import { WriterBox, writer } from './writer'
import { comonad as createComonad } from './comonad'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { Tuple2Box, tuple2 } from 'ghc/base/tuple/tuple'

export interface WriterComonadApply<W> extends ComonadApply {
    '<@>'<A, B>(f: WriterBox<W, FunctionArrow<A, B>>, wa: WriterBox<W, A>): WriterBox<W, B>
    liftW2<A, B, C>(f: FunctionArrow2<A, B, C>, wa: WriterBox<W, A>, wb: WriterBox<W, B>): WriterBox<W, C>

    extract<A>(wa: WriterBox<W, A>): A
    extend<A, B>(f: (wa: WriterBox<W, A>) => B, wa: WriterBox<W, A>): WriterBox<W, B>
    duplicate<A>(wa: WriterBox<W, A>): WriterBox<W, WriterBox<W, A>>

    fmap<A, B>(f: (a: A) => B, fa: WriterBox<W, A>): WriterBox<W, B>
    '<$>'<A, B>(f: (a: A) => B, fa: WriterBox<W, A>): WriterBox<W, B>
    '<$'<A, B>(a: A, fb: WriterBox<W, B>): WriterBox<W, A>
    '$>'<A, B>(fa: WriterBox<W, A>, b: B): WriterBox<W, B>
    '<&>'<A, B>(fa: WriterBox<W, A>, f: (a: A) => B): WriterBox<W, B>
    void<A>(fa: WriterBox<W, A>): WriterBox<W, []>
}

const baseImplementation = <W>(): BaseImplementation => ({
    '<@>': <A, B>(wf: WriterBox<W, FunctionArrow<A, B>>, wa: WriterBox<W, A>): WriterBox<W, B> =>
        writer(() => {
            const [f, w] = wf.runWriter()
            const [a] = wa.runWriter()
            return tuple2(f(a), w) as Tuple2Box<B, W>
        }),
    liftW2: <A, B, C>(f: FunctionArrow2<A, B, C>, wa: WriterBox<W, A>, wb: WriterBox<W, B>): WriterBox<W, C> =>
        writer(() => {
            const [a, w] = wa.runWriter()
            const [b] = wb.runWriter()
            return tuple2(f(a)(b), w) as Tuple2Box<C, W>
        }),
})

export const comonadApply = <W>(): WriterComonadApply<W> => {
    const cm = createComonad<W>()
    const base = baseImplementation<W>()
    return createComonadApply(base, cm) as WriterComonadApply<W>
}
