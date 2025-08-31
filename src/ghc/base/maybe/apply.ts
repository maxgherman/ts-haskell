import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'ghc/base/maybe/applicative'

export const apply = fromApplicative(applicative)
