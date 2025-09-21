import { BiFoldable, bifoldable as createBiFoldable, BiFoldableBase } from 'data/bifoldable'
import { Foldable } from 'data/foldable'
import { Monoid } from 'ghc/base/monoid'
import { MinBox0 } from 'data/kind'
import { EitherTBox } from './either-t'
import { EitherBox } from 'data/either/either'
import { bifoldable as eitherBifoldable } from 'data/either/bifoldable'

const base = (foldable: Foldable): BiFoldableBase => {
    const either = eitherBifoldable()

    return {
        bifoldMap: <A, B, M>(
            m: Monoid<M>,
            f: (a: A) => MinBox0<M>,
            g: (b: B) => MinBox0<M>,
            fab: EitherTBox<A, B>,
        ): MinBox0<M> =>
            foldable.foldMap(m, (inner: EitherBox<A, B>) => either.bifoldMap(m, f, g, inner), fab.runEitherT()),
    }
}

export const bifoldable = (foldable: Foldable): BiFoldable => createBiFoldable(base(foldable))
