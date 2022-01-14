// instance Applicative ((->) a) -- Defined in ‘GHC.Base’

import { $const } from 'ghc/base/functions'
import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { FunctionArrow, FunctionArrow2, FunctionArrowBox, withKind } from 'ghc/prim/function-arrow'
import { functor as createFunctor } from 'ghc/base/function-arrow/functor'

export interface FunctionArrowApplicative<T> extends Applicative {
    pure<A>(a: A): FunctionArrowBox<T, A>

    '<*>'<A, B>(f: FunctionArrowBox<T, FunctionArrow<A, B>>, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B>

    liftA2<A, B, C>(
        f: FunctionArrow2<A, B, C>,
        fa: FunctionArrowBox<T, A>,
        fb: FunctionArrowBox<T, B>,
    ): FunctionArrowBox<T, C>

    '*>'<A, B>(fa: FunctionArrowBox<T, A>, fb: FunctionArrowBox<T, B>): FunctionArrowBox<T, B>

    '<*'<A, B>(fa: FunctionArrowBox<T, A>, fb: FunctionArrowBox<T, B>): FunctionArrowBox<T, A>

    '<**>'<A, B>(fa: FunctionArrowBox<T, A>, f: FunctionArrowBox<T, FunctionArrow<A, B>>): FunctionArrowBox<T, B>

    fmap<A, B>(f: (a: A) => B, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B>

    '<$>'<A, B>(f: (a: A) => B, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B>

    '<$'<A, B>(a: A, fb: FunctionArrowBox<T, B>): FunctionArrowBox<T, A>

    '$>'<A, B>(fa: FunctionArrowBox<T, A>, b: B): FunctionArrowBox<T, B>

    '<&>'<A, B>(fa: FunctionArrowBox<T, A>, f: (a: A) => B): FunctionArrowBox<T, B>

    void<A>(fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, []>
}

const baseImplementation = <T>(): BaseImplementation => ({
    // pure = const
    pure: <A>(a: NonNullable<A>): FunctionArrowBox<T, A> => withKind($const(a)),

    // (<*>) f g x = f x (g x)
    '<*>': <A, B>(f: FunctionArrowBox<T, FunctionArrow<A, B>>, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B> =>
        withKind((x: T) => f(x)(fa(x))),

    // liftA2 q f g x = q (f x) (g x)
    liftA2: <A, B, C>(
        f: FunctionArrow2<A, B, C>,
        fa: FunctionArrowBox<T, A>,
        fb: FunctionArrowBox<T, B>,
    ): FunctionArrowBox<T, C> => withKind((x: T) => f(fa(x))(fb(x))),
})

export const applicative = <T>(): FunctionArrowApplicative<T> => {
    const base = baseImplementation<T>()
    const functor = createFunctor<T>()
    return createApplicative(base, functor) as FunctionArrowApplicative<T>
}
