import { monadPlus as createMonadPlus, MonadPlus } from './monad-plus'
import { monad } from 'data/either/monad'
import { alternative, EitherAlternative } from 'data/either/alternative'
import { EitherBox } from 'data/either/either'
import { Monoid } from 'ghc/base/monoid'
import type { List } from 'ghc/base/list/list'
import type { EitherMonad } from 'data/either/monad'

export type EitherMonadPlus<T> = EitherMonad<T> &
    EitherAlternative<T> & {
        mzero<A>(): EitherBox<T, A>
        mplus<A>(a: EitherBox<T, A>, b: EitherBox<T, A>): EitherBox<T, A>
        msum<A>(ms: List<EitherBox<T, A>>): EitherBox<T, A>
    }

export const monadPlus = <T>(monoid: Monoid<T>): EitherMonadPlus<T> => {
    const alt = alternative<T>(monoid)
    const base = {
        mzero: alt.empty,
        mplus: alt['<|>'],
    }
    return createMonadPlus(base, monad<T>(), alt) as EitherMonadPlus<T>
}
