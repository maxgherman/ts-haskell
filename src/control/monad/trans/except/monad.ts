import type { Monad } from 'ghc/base/monad/monad'
import { monad as eitherTMonad } from '../either/monad'
import type { EitherTMonad } from '../either/monad'

export type ExceptTMonad<E> = EitherTMonad<E>
export const monad = <E>(m: Monad) => eitherTMonad<E>(m)
