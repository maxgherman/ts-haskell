import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import type { Monad } from 'ghc/base/monad/monad'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { Monoid } from 'ghc/base/monoid'
import type { MinBox0, MinBox1 } from 'data/kind'
import { WriterTBox, writerT } from './writer-t'
import { functor as createFunctor } from './functor'
import { tuple2 } from 'ghc/base/tuple/tuple'

export interface WriterTApplicative<W> extends Applicative {
    pure<A>(a: A): WriterTBox<W, A>

    '<*>'<A, B>(f: WriterTBox<W, FunctionArrow<A, B>>, fa: WriterTBox<W, A>): WriterTBox<W, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: WriterTBox<W, A>, fb: WriterTBox<W, B>): WriterTBox<W, C>

    '*>'<A, B>(fa: WriterTBox<W, A>, fb: WriterTBox<W, B>): WriterTBox<W, B>

    '<*'<A, B>(fa: WriterTBox<W, A>, fb: WriterTBox<W, B>): WriterTBox<W, A>

    '<**>'<A, B>(fa: WriterTBox<W, A>, f: WriterTBox<W, FunctionArrow<A, B>>): WriterTBox<W, B>

    fmap<A, B>(f: (a: A) => B, fa: WriterTBox<W, A>): WriterTBox<W, B>

    '<$>'<A, B>(f: (a: A) => B, fa: WriterTBox<W, A>): WriterTBox<W, B>

    '<$'<A, B>(a: A, fb: WriterTBox<W, B>): WriterTBox<W, A>

    '$>'<A, B>(fa: WriterTBox<W, A>, b: B): WriterTBox<W, B>

    '<&>'<A, B>(fa: WriterTBox<W, A>, f: (a: A) => B): WriterTBox<W, B>

    void<A>(fa: WriterTBox<W, A>): WriterTBox<W, []>
}

const baseImpl = <W>(m: Monad, wMonoid: Monoid<W>): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): WriterTBox<W, A> => writerT(() => m.pure(tuple2(a, wMonoid.mempty as W))),

    '<*>': <A, B>(f: WriterTBox<W, FunctionArrow<A, B>>, fa: WriterTBox<W, A>): WriterTBox<W, B> =>
        writerT(() =>
            m.liftA2(
                ([g, w1]: [(a: A) => B, W]) =>
                    ([a, w2]: [A, W]) =>
                        tuple2(
                            g(a),
                            wMonoid['<>'](w1 as unknown as MinBox0<W>, w2 as unknown as MinBox0<W>) as unknown as W,
                        ),
                f.runWriterT() as unknown as MinBox1<[FunctionArrow<A, B>, W]>,
                fa.runWriterT() as unknown as MinBox1<[A, W]>,
            ),
        ),

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: WriterTBox<W, A>, fb: WriterTBox<W, B>): WriterTBox<W, C> =>
        writerT(() =>
            m.liftA2(
                ([a, w1]: [A, W]) =>
                    ([b, w2]: [B, W]) =>
                        tuple2(
                            f(a)(b),
                            wMonoid['<>'](w1 as unknown as MinBox0<W>, w2 as unknown as MinBox0<W>) as unknown as W,
                        ),
                fa.runWriterT() as unknown as MinBox1<[A, W]>,
                fb.runWriterT() as unknown as MinBox1<[B, W]>,
            ),
        ),
})

export const applicative = <W>(m: Monad, wMonoid: Monoid<W>): WriterTApplicative<W> => {
    const functor = createFunctor<W>(m)
    return createApplicative(baseImpl<W>(m, wMonoid), functor) as WriterTApplicative<W>
}
