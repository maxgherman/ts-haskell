import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'ghc/base/function-arrow/applicative'

export const apply = <T>() => fromApplicative(applicative<T>())
