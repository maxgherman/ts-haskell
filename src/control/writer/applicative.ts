import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { writer, WriterBox } from './writer'
import { functor as createFunctor } from './functor'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { tuple2 } from 'ghc/base/tuple/tuple'
import type { Monoid } from 'ghc/base/monoid'
import { MinBox0 } from 'data/kind'

export interface WriterApplicative<W> extends Applicative {
    pure<A>(a: A): WriterBox<W, A>

    '<*>'<A, B>(f: WriterBox<W, FunctionArrow<A, B>>, fa: WriterBox<W, A>): WriterBox<W, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: WriterBox<W, A>, fb: WriterBox<W, B>): WriterBox<W, C>

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

const baseImplementation = <W>(wMonoid: Monoid<W>): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): WriterBox<W, A> => writer(() => tuple2(a, wMonoid.mempty as W)),

    '<*>': <A, B>(f: WriterBox<W, FunctionArrow<A, B>>, fa: WriterBox<W, A>): WriterBox<W, B> =>
        writer(() => {
            const [fn, w1] = f.runWriter()
            const [a, w2] = fa.runWriter()
            return tuple2(fn(a), wMonoid['<>'](w1 as MinBox0<W>, w2 as MinBox0<W>) as W)
        }),

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: WriterBox<W, A>, fb: WriterBox<W, B>): WriterBox<W, C> =>
        writer(() => {
            const [a, w1] = fa.runWriter()
            const [b, w2] = fb.runWriter()
            return tuple2(f(a)(b), wMonoid['<>'](w1 as MinBox0<W>, w2 as MinBox0<W>) as W)
        }),
})

export const applicative = <W>(wMonoid: Monoid<W>): WriterApplicative<W> => {
    const functor = createFunctor<W>()
    const base = baseImplementation<W>(wMonoid)
    return createApplicative(base, functor) as WriterApplicative<W>
}
