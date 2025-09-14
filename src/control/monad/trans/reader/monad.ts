import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative as createApplicative } from './applicative'
import { ReaderTBox, readerT } from './reader-t'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface ReaderTMonad<R> extends Monad {
    '>>='<A, B>(ma: ReaderTBox<R, A>, f: FunctionArrow<A, ReaderTBox<R, B>>): ReaderTBox<R, B>

    '>>'<A, B>(ma: ReaderTBox<R, A>, mb: ReaderTBox<R, B>): ReaderTBox<R, B>

    return<A>(a: NonNullable<A>): ReaderTBox<R, A>

    pure<A>(a: NonNullable<A>): ReaderTBox<R, A>

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

const baseImplementation = <R>(m: Monad) => ({
    '>>=': <A, B>(ma: ReaderTBox<R, A>, f: FunctionArrow<A, ReaderTBox<R, B>>): ReaderTBox<R, B> =>
        readerT((r: R) => m['>>='](ma.runReaderT(r), (a: A) => f(a).runReaderT(r))),
})

export const monad = <R>(m: Monad): ReaderTMonad<R> => {
    const base = baseImplementation<R>(m)
    const applicative = createApplicative<R>(m)
    return createMonad(base, applicative) as ReaderTMonad<R>
}
