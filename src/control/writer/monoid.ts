import { Monoid, MonoidBase, monoid as createMonoid } from 'ghc/base/monoid'
import { semigroup } from './semigroup'
import { writer, WriterMinBox } from './writer'
import { tuple2 } from 'ghc/base/tuple/tuple'
import { List } from 'ghc/base/list/list'

export interface WriterMonoid<W, A> extends Monoid<WriterMinBox<W, A>> {
    readonly mempty: WriterMinBox<W, A>
    '<>'(a: WriterMinBox<W, A>, b: WriterMinBox<W, A>): WriterMinBox<W, A>
    mappend(a: WriterMinBox<W, A>, b: WriterMinBox<W, A>): WriterMinBox<W, A>
    mconcat(_: List<WriterMinBox<W, A>>): WriterMinBox<W, A>
}

const base = <W, A>(wMonoid: Monoid<W>, aMonoid: Monoid<A>): MonoidBase<WriterMinBox<W, A>> => ({
    ...semigroup(wMonoid, aMonoid),
    mempty: writer(() => tuple2(aMonoid.mempty, wMonoid.mempty)) as WriterMinBox<W, A>,
})

export const monoid = <W, A>(wMonoid: Monoid<W>, aMonoid: Monoid<A>): WriterMonoid<W, A> =>
    createMonoid(base<W, A>(wMonoid, aMonoid)) as WriterMonoid<W, A>
