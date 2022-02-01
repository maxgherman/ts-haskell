// instance (Monoid a, Monoid b) => Monoid (a, b) -- Defined in ‘GHC.Base’

import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'
import { semigroup } from './tuple2-semigroup'
import { tuple2, TupleMinBox } from './tuple'
import type { List } from 'ghc/base/list/list'

export interface Tuple2Monoid<T1, T2> extends Monoid<TupleMinBox<T1, T2>> {
    readonly mempty: TupleMinBox<T1, T2>
    '<>'(a: TupleMinBox<T1, T2>, b: TupleMinBox<T1, T2>): TupleMinBox<T1, T2>
    mappend(a: TupleMinBox<T1, T2>, b: TupleMinBox<T1, T2>): TupleMinBox<T1, T2>
    mconcat(_: List<TupleMinBox<T1, T2>>): TupleMinBox<T1, T2>
}

const base = <T1, T2>(innerMonoid1: Monoid<T1>, innerMonoid2: Monoid<T2>): MonoidBase<TupleMinBox<T1, T2>> => ({
    ...semigroup(innerMonoid1, innerMonoid2),
    mempty: tuple2(innerMonoid1.mempty, innerMonoid2.mempty),
})

export const monoid = <T1, T2>(innerMonoid1: Monoid<T1>, innerMonoid2: Monoid<T2>): Tuple2Monoid<T1, T2> => {
    const baseMonoid = base(innerMonoid1, innerMonoid2)
    return createMonoid(baseMonoid) as Tuple2Monoid<T1, T2>
}
