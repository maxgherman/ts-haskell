import { BiTraversable, bitraversable as createBiTraversable, BaseImplementation } from 'data/bitraversable'
import { Traversable } from 'data/traversable'
import { Functor } from 'ghc/base/functor'
import { Foldable } from 'data/foldable'
import { Applicative } from 'ghc/base/applicative'
import { MinBox1 } from 'data/kind'
import { EitherTBox, eitherT } from './either-t'
import { EitherBox } from 'data/either/either'
import { bitraversable as eitherBiTraversable } from 'data/either/bitraversable'
import { bifunctor as eitherTBifunctor } from './bifunctor'
import { bifoldable as eitherTBifoldable } from './bifoldable'

const base = (traversable: Traversable): BaseImplementation => {
    const either = eitherBiTraversable()

    return {
        bitraverse: <A, B, C, D>(
            app: Applicative,
            f: (a: A) => MinBox1<C>,
            g: (b: B) => MinBox1<D>,
            fab: EitherTBox<A, B>,
        ): MinBox1<EitherTBox<C, D>> =>
            app['<$>'](
                (inner: MinBox1<EitherBox<C, D>>) => eitherT(() => inner),
                traversable.traverse(
                    app,
                    (value: EitherBox<A, B>) => either.bitraverse(app, f, g, value),
                    fab.runEitherT(),
                ),
            ),
    }
}

export const bitraversable = (functor: Functor, foldable: Foldable, traversable: Traversable): BiTraversable =>
    createBiTraversable(base(traversable), eitherTBifunctor(functor), eitherTBifoldable(foldable))
