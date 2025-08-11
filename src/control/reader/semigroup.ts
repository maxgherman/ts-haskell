import { Semigroup } from 'ghc/base/semigroup'
import { semigroup as functionSemigroup } from 'ghc/base/function-arrow/semigroup'
import { ReaderBox } from './reader'

export type ReaderSemigroup<R, A> = Semigroup<ReaderBox<R, A>>

export const semigroup = <R, A>(inner: Semigroup<A>): ReaderSemigroup<R, A> =>
    functionSemigroup<R, A>(inner) as ReaderSemigroup<R, A>
