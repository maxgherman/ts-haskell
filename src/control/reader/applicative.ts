import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { reader, ReaderBox } from './reader'
import { functor as createFunctor } from './functor'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface ReaderApplicative<R> extends Applicative {
    pure<A>(a: A): ReaderBox<R, A>

    '<*>'<A, B>(f: ReaderBox<R, FunctionArrow<A, B>>, fa: ReaderBox<R, A>): ReaderBox<R, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: ReaderBox<R, A>, fb: ReaderBox<R, B>): ReaderBox<R, C>

    '*>'<A, B>(fa: ReaderBox<R, A>, fb: ReaderBox<R, B>): ReaderBox<R, B>

    '<*'<A, B>(fa: ReaderBox<R, A>, fb: ReaderBox<R, B>): ReaderBox<R, A>

    '<**>'<A, B>(fa: ReaderBox<R, A>, f: ReaderBox<R, FunctionArrow<A, B>>): ReaderBox<R, B>

    fmap<A, B>(f: (a: A) => B, fa: ReaderBox<R, A>): ReaderBox<R, B>

    '<$>'<A, B>(f: (a: A) => B, fa: ReaderBox<R, A>): ReaderBox<R, B>

    '<$'<A, B>(a: A, fb: ReaderBox<R, B>): ReaderBox<R, A>

    '$>'<A, B>(fa: ReaderBox<R, A>, b: B): ReaderBox<R, B>

    '<&>'<A, B>(fa: ReaderBox<R, A>, f: (a: A) => B): ReaderBox<R, B>

    void<A>(fa: ReaderBox<R, A>): ReaderBox<R, []>
}

const baseImplementation = <R>(): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): ReaderBox<R, A> => reader((_: R) => a),

    '<*>': <A, B>(f: ReaderBox<R, FunctionArrow<A, B>>, fa: ReaderBox<R, A>): ReaderBox<R, B> =>
        reader((r: R) => f.runReader(r)(fa.runReader(r))),
    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: ReaderBox<R, A>, fb: ReaderBox<R, B>): ReaderBox<R, C> =>
        reader((r: R) => f(fa.runReader(r))(fb.runReader(r))),
})

export const applicative = <R>(): ReaderApplicative<R> => {
    const functor = createFunctor<R>()
    const base = baseImplementation<R>()
    return createApplicative(base, functor) as ReaderApplicative<R>
}
