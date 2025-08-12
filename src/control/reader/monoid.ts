import { Monoid, MonoidBase, monoid as createMonoid } from 'ghc/base/monoid'
import { semigroup } from './semigroup'
import { ReaderMinBox, reader } from './reader'
import { List } from 'ghc/base/list/list'

export interface ReaderMonoid<R, A> extends Monoid<ReaderMinBox<R, A>> {
    readonly mempty: ReaderMinBox<R, A>
    '<>'(a: ReaderMinBox<R, A>, b: ReaderMinBox<R, A>): ReaderMinBox<R, A>
    mappend(a: ReaderMinBox<R, A>, b: ReaderMinBox<R, A>): ReaderMinBox<R, A>
    mconcat(_: List<ReaderMinBox<R, A>>): ReaderMinBox<R, A>
}

const base = <R, A>(inner: Monoid<A>): MonoidBase<ReaderMinBox<R, A>> => ({
    ...semigroup(inner),
    mempty: reader((_: R) => inner.mempty) as ReaderMinBox<R, A>,
})

export const monoid = <R, A>(inner: Monoid<A>): ReaderMonoid<R, A> =>
    createMonoid(base<R, A>(inner)) as ReaderMonoid<R, A>
