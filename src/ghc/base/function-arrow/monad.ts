// instance Monad ((->) r) -- Defined in ‘GHC.Base’

import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative as createApplicative } from 'ghc/base/function-arrow/applicative'
import { FunctionArrow, FunctionArrow2, FunctionArrowBox, withKind } from 'ghc/prim/function-arrow'

export interface FunctionArrowMonad<T> extends Monad {
    '>>='<A, B>(ma: FunctionArrowBox<T, A>, f: FunctionArrow<A, FunctionArrowBox<T, B>>): FunctionArrowBox<T, B>

    '>>'<A, B>(ma: FunctionArrowBox<T, A>, mb: FunctionArrowBox<T, B>): FunctionArrowBox<T, B>

    return<A>(a: NonNullable<A>): FunctionArrowBox<T, A>

    pure<A>(a: NonNullable<A>): FunctionArrowBox<T, A>

    '<*>'<A, B>(f: FunctionArrowBox<T, FunctionArrowBox<A, B>>, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B>

    liftA2<A, B, C>(
        f: FunctionArrow2<A, B, C>,
        fa: FunctionArrowBox<T, A>,
        fb: FunctionArrowBox<T, B>,
    ): FunctionArrowBox<T, C>

    '*>'<A, B>(fa: FunctionArrowBox<T, A>, fb: FunctionArrowBox<T, B>): FunctionArrowBox<T, B>

    '<*'<A, B>(fa: FunctionArrowBox<T, A>, fb: FunctionArrowBox<T, B>): FunctionArrowBox<T, A>

    '<**>'<A, B>(fa: FunctionArrowBox<T, A>, f: FunctionArrowBox<T, FunctionArrowBox<A, B>>): FunctionArrowBox<T, B>

    fmap<A, B>(f: (a: A) => B, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B>

    '<$>'<A, B>(f: (a: A) => B, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B>

    '<$'<A, B>(a: A, fb: FunctionArrowBox<T, B>): FunctionArrowBox<T, A>

    '$>'<A, B>(fa: FunctionArrowBox<T, A>, b: B): FunctionArrowBox<T, B>

    '<&>'<A, B>(fa: FunctionArrowBox<T, A>, f: (a: A) => B): FunctionArrowBox<T, B>

    void<A>(fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, []>
}

const baseImplementation = <T>() => ({
    // ma >>= f = \ t -> f (ma t) t
    '>>=': <A, B>(ma: FunctionArrowBox<T, A>, f: FunctionArrow<A, FunctionArrowBox<T, B>>): FunctionArrowBox<T, B> =>
        withKind((t: T) => {
            return f(ma(t))(t)
        }),
})

export const monad = <T>(): FunctionArrowMonad<T> => {
    const base = baseImplementation<T>()
    const applicative = createApplicative<T>()

    return createMonad(base, applicative) as FunctionArrowMonad<T>
}
