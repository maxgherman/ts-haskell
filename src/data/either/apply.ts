import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'data/either/applicative'

export const apply = <T>() => fromApplicative(applicative<T>())
