import { EitherTBox, eitherT, runEitherT, lift as liftEitherT } from '../either/either-t'
import type { Monad } from 'ghc/base/monad/monad'
import type { MinBox1 } from 'data/kind'

// ExceptT e m a is a thin alias over EitherT e m a
export type ExceptT<E, A> = EitherTBox<E, A>
export type ExceptTBox<E, A> = EitherTBox<E, A>

export const exceptT = eitherT
export const runExceptT = runEitherT
export const lift = <E, A>(m: Monad, ma: MinBox1<A>): ExceptTBox<E, A> => liftEitherT<E, A>(m, ma)
