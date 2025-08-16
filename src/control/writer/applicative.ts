import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { writer, WriterBox } from './writer'
import { functor as createFunctor } from './functor'
import { Tuple2Box, tuple2 } from 'ghc/base/tuple/tuple'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { Monoid } from 'ghc/base/monoid'
import { MinBox0 } from 'data/kind'

export interface WriterApplicative<W> extends Applicative {
    pure<A>(a: A): WriterBox<W, A>

    '<*>'<A, B>(f: WriterBox<W, FunctionArrow<A, B>>, fa: WriterBox<W, A>): WriterBox<W, B>

    liftA2<A, B, C>(
        f: FunctionArrow2<A, B, C>,
        fa: WriterBox<W, A>,
        fb: WriterBox<W, B>,
    ): WriterBox<W, C>

    '*>'<A, B>(fa: WriterBox<W, A>, fb: WriterBox<W, B>): WriterBox<W, B>

    '<*'<A, B>(fa: WriterBox<W, A>, fb: WriterBox<W, B>): WriterBox<W, A>

    '<**>'<A, B>(fa: WriterBox<W, A>, f: WriterBox<W, FunctionArrow<A, B>>): WriterBox<W, B>

    fmap<A, B>(f: (a: A) => B, fa: WriterBox<W, A>): WriterBox<W, B>

    '<$>'<A, B>(f: (a: A) => B, fa: WriterBox<W, A>): WriterBox<W, B>

    '<$'<A, B>(a: A, fb: WriterBox<W, B>): WriterBox<W, A>

    '$>'<A, B>(fa: WriterBox<W, A>, b: B): WriterBox<W, B>

    '<&>'<A, B>(fa: WriterBox<W, A>, f: (a: A) => B): WriterBox<W, B>

    void<A>(fa: WriterBox<W, A>): WriterBox<W, []>
}

const baseImplementation = <W>(monoid: Monoid<W>): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): WriterBox<W, A> =>
        writer(() => tuple2(a, monoid.mempty as W) as Tuple2Box<A, W>),

    '<*>': <A, B>(
        f: WriterBox<W, FunctionArrow<A, B>>,
        fa: WriterBox<W, A>,
    ): WriterBox<W, B> =>
        writer(() => {
            const [g, w1] = f.runWriter()
            const [a, w2] = fa.runWriter()
            return tuple2(
                g(a),
                monoid['<>'](w1 as MinBox0<W>, w2 as MinBox0<W>) as W,
            ) as Tuple2Box<B, W>
        }),

    liftA2: <A, B, C>(
        f: FunctionArrow2<A, B, C>,
        fa: WriterBox<W, A>,
        fb: WriterBox<W, B>,
    ): WriterBox<W, C> =>
        writer(() => {
            const [a, w1] = fa.runWriter()
            const [b, w2] = fb.runWriter()
            return tuple2(
                f(a)(b),
                monoid['<>'](w1 as MinBox0<W>, w2 as MinBox0<W>) as W,
            ) as Tuple2Box<C, W>
        }),
})

export const applicative = <W>(monoid: Monoid<W>): WriterApplicative<W> => {
    const functor = createFunctor<W>()
    const base = baseImplementation<W>(monoid)
    return createApplicative(base, functor) as WriterApplicative<W>
}

