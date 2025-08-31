import { fromApplicative } from 'data/functor/apply'
import { applicative } from 'control/state/applicative'

export const apply = <S>() => fromApplicative(applicative<S>())
