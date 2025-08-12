import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative as createApplicative } from './applicative'
import { reader, ReaderBox } from './reader'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface ReaderMonad<R> extends Monad {
    '>>='<A, B>(ma: ReaderBox<R, A>, f: FunctionArrow<A, ReaderBox<R, B>>): ReaderBox<R, B>

    '>>'<A, B>(ma: ReaderBox<R, A>, mb: ReaderBox<R, B>): ReaderBox<R, B>

    return<A>(a: NonNullable<A>): ReaderBox<R, A>

    pure<A>(a: NonNullable<A>): ReaderBox<R, A>

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

const baseImplementation = <R>() => ({
    '>>=': <A, B>(ma: ReaderBox<R, A>, f: FunctionArrow<A, ReaderBox<R, B>>): ReaderBox<R, B> =>
        reader((r: R) => f(ma.runReader(r)).runReader(r)),
})

export const monad = <R>(): ReaderMonad<R> => {
    const base = baseImplementation<R>()
    const applicative = createApplicative<R>()
    return createMonad(base, applicative) as ReaderMonad<R>
}
