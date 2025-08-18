import { comonad as createComonad, Comonad, BaseImplementation } from 'control/comonad'
import { writer, WriterBox } from './writer'
import { functor as createFunctor } from './functor'
import { Tuple2Box, tuple2 } from 'ghc/base/tuple/tuple'

export interface WriterComonad<W> extends Comonad {
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
    extract: <A>(wa: WriterBox<W, A>): A => wa.runWriter()[0],
    extend: <A, B>(f: (wa: WriterBox<W, A>) => B, wa: WriterBox<W, A>): WriterBox<W, B> =>
        writer(() => {
            const [, w] = wa.runWriter()
            return tuple2(f(wa), w) as Tuple2Box<B, W>
        }),
    duplicate: <A>(wa: WriterBox<W, A>): WriterBox<W, WriterBox<W, A>> =>
        writer(() => {
            const [, w] = wa.runWriter()
            return tuple2(wa, w) as Tuple2Box<WriterBox<W, A>, W>
        }),
})

export const comonad = <W>(): WriterComonad<W> => {
    const functor = createFunctor<W>()
    const base = baseImplementation<W>()
    return createComonad(base, functor) as WriterComonad<W>
}
