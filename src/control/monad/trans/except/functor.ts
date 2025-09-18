import type { Monad } from 'ghc/base/monad/monad'
import { functor as eitherTFunctor } from '../either/functor'
import type { EitherTFunctor } from '../either/functor'

export type ExceptTFunctor<E> = EitherTFunctor<E>
export const functor = <E>(m: Monad) => eitherTFunctor<E>(m)
