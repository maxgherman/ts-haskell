import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'ghc/base/non-empty/applicative'

export const apply = fromApplicative(applicative)
