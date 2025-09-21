import { Applicative } from 'ghc/base/applicative'
import { BiTraversable, bitraversable as createBiTraversable, BaseImplementation } from 'data/bitraversable'
import { bifunctor } from './bifunctor'
import { bifoldable } from './bifoldable'
import { $case, left, right, EitherBox } from './either'
import { MinBox1 } from 'data/kind'

export interface EitherBiTraversable extends BiTraversable {
    bitraverse<A, B, C, D>(
        app: Applicative,
        f: (a: A) => MinBox1<C>,
        g: (b: B) => MinBox1<D>,
        fab: EitherBox<A, B>,
    ): MinBox1<EitherBox<C, D>>
    bisequenceA<A, B>(app: Applicative, tfab: EitherBox<MinBox1<A>, MinBox1<B>>): MinBox1<EitherBox<A, B>>
}

const base: BaseImplementation = {
    bitraverse: <A, B, C, D>(
        app: Applicative,
        f: (a: A) => MinBox1<C>,
        g: (b: B) => MinBox1<D>,
        fab: EitherBox<A, B>,
    ): MinBox1<EitherBox<C, D>> =>
        $case<A, B, MinBox1<EitherBox<C, D>>>({
            left: (a: A) => app['<$>']((c: C) => left<C, D>(c as NonNullable<C>), f(a)),
            right: (b: B) => app['<$>']((d: D) => right<C, D>(d as NonNullable<D>), g(b)),
        })(fab),
}

export const bitraversable = () => createBiTraversable(base, bifunctor(), bifoldable()) as EitherBiTraversable
