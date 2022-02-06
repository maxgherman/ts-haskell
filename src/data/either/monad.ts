// instance Monad (Either e) -- Defined in ‘Data.Either’

import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative as createApplicative } from 'data/either/applicative'
import { EitherBox, $case, left } from 'data/either/either'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface EitherMonad<T> extends Monad {
    '>>='<A, B>(ma: EitherBox<NonNullable<T>, A>, f: FunctionArrow<A, EitherBox<T, B>>): EitherBox<T, B>

    '>>'<A, B>(ma: EitherBox<T, A>, mb: EitherBox<T, B>): EitherBox<T, B>

    return<A>(a: NonNullable<A>): EitherBox<T, A>

    pure<A>(a: NonNullable<A>): EitherBox<T, A>

    '<*>'<A, B>(f: EitherBox<NonNullable<T>, FunctionArrow<A, B>>, fa: EitherBox<T, A>): EitherBox<T, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: EitherBox<T, A>, fb: EitherBox<T, B>): EitherBox<T, C>

    '*>'<A, B>(fa: EitherBox<T, A>, fb: EitherBox<T, B>): EitherBox<T, B>

    '<*'<A, B>(fa: EitherBox<T, A>, fb: EitherBox<T, B>): EitherBox<T, A>

    '<**>'<A, B>(fa: EitherBox<T, A>, f: EitherBox<T, FunctionArrow<A, B>>): EitherBox<T, B>

    fmap<A, B>(f: (a: A) => B, fa: EitherBox<T, A>): EitherBox<T, B>

    '<$>'<A, B>(f: (a: A) => B, fa: EitherBox<T, A>): EitherBox<T, B>

    '<$'<A, B>(a: A, fb: EitherBox<T, B>): EitherBox<T, A>

    '$>'<A, B>(fa: EitherBox<T, A>, b: B): EitherBox<T, B>

    '<&>'<A, B>(fa: EitherBox<T, A>, f: (a: A) => B): EitherBox<T, B>

    void<A>(fa: EitherBox<T, A>): EitherBox<T, []>
}

const baseImplementation = <T>() => ({
    '>>=': <A, B>(ma: EitherBox<NonNullable<T>, A>, f: FunctionArrow<A, EitherBox<T, B>>): EitherBox<T, B> =>
        $case<NonNullable<T>, A, EitherBox<T, B>>({
            left: (x) => left(x),
            right: (x) => f(x),
        })(ma),
})

export const monad = <T>(): EitherMonad<T> => {
    const base = baseImplementation<T>()
    const applicative = createApplicative<T>()

    return createMonad(base, applicative) as EitherMonad<T>
}
