import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative as createApplicative } from './applicative'
import { EitherTBox, eitherT } from './either-t'
import { EitherBox, $case, left } from 'data/either/either'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface EitherTMonad<E> extends Monad {
    '>>='<A, B>(ma: EitherTBox<E, A>, f: FunctionArrow<A, EitherTBox<E, B>>): EitherTBox<E, B>

    '>>'<A, B>(ma: EitherTBox<E, A>, mb: EitherTBox<E, B>): EitherTBox<E, B>

    return<A>(a: NonNullable<A>): EitherTBox<E, A>

    pure<A>(a: NonNullable<A>): EitherTBox<E, A>

    '<*>'<A, B>(f: EitherTBox<E, FunctionArrow<A, B>>, fa: EitherTBox<E, A>): EitherTBox<E, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: EitherTBox<E, A>, fb: EitherTBox<E, B>): EitherTBox<E, C>

    '*>'<A, B>(fa: EitherTBox<E, A>, fb: EitherTBox<E, B>): EitherTBox<E, B>

    '<*'<A, B>(fa: EitherTBox<E, A>, fb: EitherTBox<E, B>): EitherTBox<E, A>

    '<**>'<A, B>(fa: EitherTBox<E, A>, f: EitherTBox<E, FunctionArrow<A, B>>): EitherTBox<E, B>

    fmap<A, B>(f: (a: A) => B, fa: EitherTBox<E, A>): EitherTBox<E, B>

    '<$>'<A, B>(f: (a: A) => B, fa: EitherTBox<E, A>): EitherTBox<E, B>

    '<$'<A, B>(a: A, fb: EitherTBox<E, B>): EitherTBox<E, A>

    '$>'<A, B>(fa: EitherTBox<E, A>, b: B): EitherTBox<E, B>

    '<&>'<A, B>(fa: EitherTBox<E, A>, f: (a: A) => B): EitherTBox<E, B>

    void<A>(fa: EitherTBox<E, A>): EitherTBox<E, []>
}

const baseImplementation = <E>(m: Monad) => ({
    '>>=': <A, B>(ma: EitherTBox<E, A>, f: FunctionArrow<A, EitherTBox<E, B>>): EitherTBox<E, B> =>
        eitherT(() =>
            m['>>='](
                ma.runEitherT(),
                (eb: EitherBox<E, A>): ReturnType<typeof m.return> =>
                    $case<E, A, ReturnType<typeof m.return>>({
                        left: (e: E) => m.pure(left<E, B>(e as NonNullable<E>) as EitherBox<E, B>),
                        right: (x: A) => f(x).runEitherT(),
                    })(eb),
            ),
        ),
})

export const monad = <E>(m: Monad): EitherTMonad<E> => {
    const base = baseImplementation<E>(m)
    const app = createApplicative<E>(m)
    return createMonad(base, app) as EitherTMonad<E>
}
