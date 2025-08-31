import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'extra/promise/applicative'

export const apply = fromApplicative(applicative)
