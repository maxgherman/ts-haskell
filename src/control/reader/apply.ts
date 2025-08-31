import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'control/reader/applicative'

export const apply = <R>() => fromApplicative(applicative<R>())
