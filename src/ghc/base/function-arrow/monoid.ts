// instance Monoid b => Monoid (a -> b) -- Defined in ‘GHC.Base’

import { Monoid, MonoidBase, monoid as createMonoid } from 'ghc/base/monoid'
import { semigroup, FunctionArrowMinBox } from './semigroup'
import { withKind } from 'ghc/prim/function-arrow'
import { List } from 'ghc/base/list/list'

export interface MonoidList<A, B> extends Monoid<FunctionArrowMinBox<A, B>> {
    readonly mempty: FunctionArrowMinBox<A, B>
    '<>'(a: FunctionArrowMinBox<A, B>, b: FunctionArrowMinBox<A, B>): FunctionArrowMinBox<A, B>
    mappend(a: FunctionArrowMinBox<A, B>, b: FunctionArrowMinBox<A, B>): FunctionArrowMinBox<A, B>
    mconcat: (_: List<FunctionArrowMinBox<A, B>>) => FunctionArrowMinBox<A, B>
}

const base = <A, B extends Monoid<B>>(innerMonoid: B): MonoidBase<FunctionArrowMinBox<A, B>> => ({
    ...semigroup(innerMonoid),
    mempty: withKind(() => innerMonoid.mempty),
})

export const monoid = <A, B extends Monoid<B>>(innerMonoid: B) =>
    createMonoid(base<A, B>(innerMonoid)) as MonoidList<A, B>
