import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import type { Monad } from 'ghc/base/monad/monad'
import { EitherBox, right } from 'data/either/either'
import { applicative as eitherApplicative } from 'data/either/applicative'
import { EitherTBox, eitherT } from './either-t'
import { functor as createFunctor } from './functor'

export interface EitherTApplicative<E> extends Applicative {
    pure<A>(a: A): EitherTBox<E, A>

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

const baseImpl = <E>(m: Monad): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): EitherTBox<E, A> => eitherT(() => m.pure(right(a) as EitherBox<E, A>)),

    '<*>': <A, B>(f: EitherTBox<E, FunctionArrow<A, B>>, fa: EitherTBox<E, A>): EitherTBox<E, B> =>
        eitherT(() =>
            m['<*>'](
                m['<$>'](
                    (mf: EitherBox<E, FunctionArrow<A, B>>) => (ma: EitherBox<E, A>) =>
                        eitherApplicative<E>()['<*>'](mf, ma) as EitherBox<E, B>,
                    f.runEitherT(),
                ),
                fa.runEitherT(),
            ),
        ),

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: EitherTBox<E, A>, fb: EitherTBox<E, B>): EitherTBox<E, C> =>
        eitherT(() =>
            m.liftA2(
                (ma: EitherBox<E, A>) => (mb: EitherBox<E, B>) => eitherApplicative<E>().liftA2(f, ma, mb),
                fa.runEitherT(),
                fb.runEitherT(),
            ),
        ),
})

export const applicative = <E>(m: Monad): EitherTApplicative<E> => {
    const functor = createFunctor<E>(m)
    return createApplicative(baseImpl<E>(m), functor) as EitherTApplicative<E>
}
