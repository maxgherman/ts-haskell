import { Bifunctor, bifunctor as createBifunctor, BifunctorBase } from 'data/bifunctor'
import { Functor } from 'ghc/base/functor'
import { EitherTBox, eitherT } from './either-t'
import { EitherBox } from 'data/either/either'
import { bifunctor as eitherBifunctor } from 'data/either/bifunctor'

const base = (functor: Functor): BifunctorBase => {
    const either = eitherBifunctor()

    return {
        bimap: <A, B, C, D>(f: (a: A) => C, g: (b: B) => D, pab: EitherTBox<A, B>): EitherTBox<C, D> =>
            eitherT(() => functor['<$>']((value: EitherBox<A, B>) => either.bimap(f, g, value), pab.runEitherT())),
    }
}

export const bifunctor = (functor: Functor): Bifunctor => createBifunctor(base(functor))
