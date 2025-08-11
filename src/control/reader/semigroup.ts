import { Semigroup } from 'ghc/base/semigroup'
import { semigroup as functionSemigroup } from 'ghc/base/function-arrow/semigroup'
import { ReaderMinBox } from './reader'

export type ReaderSemigroup<R, A> = Semigroup<ReaderMinBox<R, A>>

export const semigroup = <R, A>(inner: Semigroup<A>): ReaderSemigroup<R, A> =>
    functionSemigroup<R, A>(inner) as ReaderSemigroup<R, A>
