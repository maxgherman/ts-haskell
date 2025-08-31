import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'ghc/base/list/applicative'

export const apply = fromApplicative(applicative)
