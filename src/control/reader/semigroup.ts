import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { ReaderMinBox, reader } from './reader'

export type ReaderSemigroup<R, A> = Semigroup<ReaderMinBox<R, A>>

const base = <R, A>(inner: Semigroup<A>): SemigroupBase<ReaderMinBox<R, A>> => ({
    '<>'(a: ReaderMinBox<R, A>, b: ReaderMinBox<R, A>): ReaderMinBox<R, A> {
        return reader((r: R) => inner['<>'](a.runReader(r), b.runReader(r))) as ReaderMinBox<R, A>
    },
})

export const semigroup = <R, A>(inner: Semigroup<A>): ReaderSemigroup<R, A> =>
    createSemigroup(base<R, A>(inner)) as ReaderSemigroup<R, A>
