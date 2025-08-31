import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'ghc/base/tuple/tuple2-applicative'
import { Monoid } from 'ghc/base/monoid'

export const apply = <T>(m: Monoid<T>) => fromApplicative(applicative<T>(m))
