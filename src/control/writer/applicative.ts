import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { writer, WriterBox } from './writer'
import { functor as createFunctor } from './functor'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import type { Monoid } from 'ghc/base/monoid'
import { tuple2 } from 'ghc/base/tuple/tuple'

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

const baseImplementation = <W>(monoid: Monoid<W>): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): WriterBox<W, A> => writer(() => tuple2(a, monoid.mempty)),
    '<*>': <A, B>(wf: WriterBox<W, FunctionArrow<A, B>>, wa: WriterBox<W, A>): WriterBox<W, B> =>
        writer(() => {
            const [f, w1] = wf.runWriter()
            const [a, w2] = wa.runWriter()
            return tuple2(f(a), monoid['<>'](w1, w2))
        }),
    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, wa: WriterBox<W, A>, wb: WriterBox<W, B>): WriterBox<W, C> =>
        writer(() => {
            const [a, w1] = wa.runWriter()
            const [b, w2] = wb.runWriter()
            return tuple2(f(a)(b), monoid['<>'](w1, w2))
        }),
})

export const applicative = <W>(monoid: Monoid<W>): WriterApplicative<W> => {
    const functor = createFunctor<W>()
    const base = baseImplementation<W>(monoid)
    return createApplicative(base, functor) as WriterApplicative<W>
}
