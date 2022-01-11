// instance Applicative (Either e) -- Defined in ‘Data.Either’

import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { left, right, $case, EitherBox } from 'data/either/either'
import { functor as createFunctor, EitherFunctor } from 'data/either/functor'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface EitherApplicative<T> extends Applicative {
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

const baseImplementation = <T>(functor: EitherFunctor<T>): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): EitherBox<T, A> => right<T, A>(a),

    '<*>': <A, B>(f: EitherBox<NonNullable<T>, FunctionArrow<A, B>>, fa: EitherBox<T, A>): EitherBox<T, B> =>
        $case<NonNullable<T>, FunctionArrow<A, B>, EitherBox<T, B>>({
            left: (e) => left<T, B>(e),
            right: (x) => functor.fmap(x, fa),
        })(f),
})

export const applicative = <T>(): EitherApplicative<T> => {
    const functor = createFunctor<T>()
    const base = baseImplementation(functor)
    return createApplicative(base, functor) as EitherApplicative<T>
}
