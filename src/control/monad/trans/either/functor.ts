import { Functor, functor as createFunctor, FunctorBase } from 'ghc/base/functor'
import type { Monad } from 'ghc/base/monad/monad'
import type { MinBox1 } from 'data/kind'
import { EitherBox } from 'data/either/either'
import { functor as eitherFunctor } from 'data/either/functor'
import { EitherTBox, eitherT } from './either-t'

export interface EitherTFunctor<E> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: EitherTBox<E, A>): EitherTBox<E, B>

    '<$>'<A, B>(f: (a: A) => B, fa: EitherTBox<E, A>): EitherTBox<E, B>

    '<$'<A, B>(a: A, fb: EitherTBox<E, B>): EitherTBox<E, A>

    '$>'<A, B>(fa: EitherTBox<E, A>, b: B): EitherTBox<E, B>

    '<&>'<A, B>(fa: EitherTBox<E, A>, f: (a: A) => B): EitherTBox<E, B>

    void<A>(fa: EitherTBox<E, A>): EitherTBox<E, []>
}

const base = <E>(m: Monad): FunctorBase => ({
    fmap: <A, B>(f: (a: A) => B, fa: EitherTBox<E, A>): EitherTBox<E, B> =>
        eitherT(
            () =>
                m['<$>'](
                    (mb: EitherBox<E, A>) =>
                        eitherFunctor<E>().fmap(f as (a: A) => B, mb) as unknown as EitherBox<E, B>,
                    fa.runEitherT(),
                ) as unknown as MinBox1<EitherBox<E, B>>,
        ),
})

export const functor = <E>(m: Monad): EitherTFunctor<E> => createFunctor(base<E>(m)) as EitherTFunctor<E>
