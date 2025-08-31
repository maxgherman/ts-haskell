import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'control/writer/applicative'
import { Monoid } from 'ghc/base/monoid'

export const apply = <W>(m: Monoid<W>) => fromApplicative(applicative<W>(m))
