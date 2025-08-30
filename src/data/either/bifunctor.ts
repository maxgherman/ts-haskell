// instance Bifunctor Either -- Defined in ‘Data.Bifunctor’

import { $case, EitherBox, left, right } from './either'
import { BifunctorBase, Bifunctor, bifunctor as createBifunctor } from 'data/bifunctor'

export interface EitherBifunctor extends Bifunctor {
    bimap<A, B, C, D>(f: (a: A) => C, g: (b: B) => D, pab: EitherBox<A, B>): EitherBox<C, D>

    first<A, B, C>(f: (a: A) => C, pab: EitherBox<A, B>): EitherBox<C, B>

    second<A, B, D>(g: (b: B) => D, pab: EitherBox<A, B>): EitherBox<A, D>
}

const base: BifunctorBase = {
    bimap: <A, B, C, D>(f: (a: A) => C, g: (b: B) => D, pab: EitherBox<A, B>): EitherBox<C, D> =>
        $case<A, B, EitherBox<C, D>>({
            left: (a: A) => left<C, D>(f(a) as NonNullable<C>),
            right: (b: B) => right<C, D>(g(b) as NonNullable<D>),
        })(pab),
}

export const bifunctor = () => createBifunctor(base) as EitherBifunctor
