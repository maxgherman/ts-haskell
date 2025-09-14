import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import type { Monad } from 'ghc/base/monad/monad'
import { ReaderTBox, readerT } from './reader-t'
import { functor as createFunctor } from './functor'

export interface ReaderTApplicative<R> extends Applicative {
    pure<A>(a: A): ReaderTBox<R, A>

    '<*>'<A, B>(f: ReaderTBox<R, FunctionArrow<A, B>>, fa: ReaderTBox<R, A>): ReaderTBox<R, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: ReaderTBox<R, A>, fb: ReaderTBox<R, B>): ReaderTBox<R, C>

    '*>'<A, B>(fa: ReaderTBox<R, A>, fb: ReaderTBox<R, B>): ReaderTBox<R, B>

    '<*'<A, B>(fa: ReaderTBox<R, A>, fb: ReaderTBox<R, B>): ReaderTBox<R, A>

    '<**>'<A, B>(fa: ReaderTBox<R, A>, f: ReaderTBox<R, FunctionArrow<A, B>>): ReaderTBox<R, B>

    fmap<A, B>(f: (a: A) => B, fa: ReaderTBox<R, A>): ReaderTBox<R, B>

    '<$>'<A, B>(f: (a: A) => B, fa: ReaderTBox<R, A>): ReaderTBox<R, B>

    '<$'<A, B>(a: A, fb: ReaderTBox<R, B>): ReaderTBox<R, A>

    '$>'<A, B>(fa: ReaderTBox<R, A>, b: B): ReaderTBox<R, B>

    '<&>'<A, B>(fa: ReaderTBox<R, A>, f: (a: A) => B): ReaderTBox<R, B>

    void<A>(fa: ReaderTBox<R, A>): ReaderTBox<R, []>
}

const baseImpl = <R>(m: Monad): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): ReaderTBox<R, A> => readerT((_r: R) => m.pure(a)),

    '<*>': <A, B>(f: ReaderTBox<R, FunctionArrow<A, B>>, fa: ReaderTBox<R, A>): ReaderTBox<R, B> =>
        readerT((r: R) => m['<*>'](f.runReaderT(r), fa.runReaderT(r))),

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: ReaderTBox<R, A>, fb: ReaderTBox<R, B>): ReaderTBox<R, C> =>
        readerT((r: R) => m.liftA2(f, fa.runReaderT(r), fb.runReaderT(r))),
})

export const applicative = <R>(m: Monad): ReaderTApplicative<R> => {
    const functor = createFunctor<R>(m)
    return createApplicative(baseImpl<R>(m), functor) as ReaderTApplicative<R>
}
