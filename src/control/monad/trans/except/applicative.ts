import type { Monad } from 'ghc/base/monad/monad'
import { applicative as eitherTApplicative } from '../either/applicative'
import type { EitherTApplicative } from '../either/applicative'

export type ExceptTApplicative<E> = EitherTApplicative<E>
export const applicative = <E>(m: Monad) => eitherTApplicative<E>(m)
