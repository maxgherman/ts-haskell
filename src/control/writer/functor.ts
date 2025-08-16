import { FunctorBase, Functor, functor as createFunctor } from 'ghc/base/functor'
import { writer, WriterBox } from './writer'
import { Tuple2Box, tuple2 } from 'ghc/base/tuple/tuple'

export interface WriterFunctor<W> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: WriterBox<W, A>): WriterBox<W, B>

    '<$>'<A, B>(f: (a: A) => B, fa: WriterBox<W, A>): WriterBox<W, B>

    '<$'<A, B>(a: A, fb: WriterBox<W, B>): WriterBox<W, A>

    '$>'<A, B>(fa: WriterBox<W, A>, b: B): WriterBox<W, B>

    '<&>'<A, B>(fa: WriterBox<W, A>, f: (a: A) => B): WriterBox<W, B>

    void<A>(fa: WriterBox<W, A>): WriterBox<W, []>
}

const fmap = <W>(): FunctorBase => ({
    // fmap :: Writer w => (a -> b) -> Writer w a -> Writer w b
    fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: WriterBox<W, A>): WriterBox<W, B> =>
        writer(() => {
            const [a, w] = fa.runWriter()
            return tuple2(f(a), w) as Tuple2Box<B, W>
        }),
})

export const functor = <W>() => createFunctor(fmap<W>()) as WriterFunctor<W>
