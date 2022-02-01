// instance Semigroup a => Monoid (Maybe a) -- Defined in ‘GHC.Base’

import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'
import { semigroup } from './semigroup'
import { MaybeBox, nothing } from './maybe'
import type { List } from 'ghc/base/list/list'
import type { Semigroup } from 'ghc/base/semigroup'

export interface MaybeMonoid<T> extends Monoid<MaybeBox<T>> {
    readonly mempty: MaybeBox<T>
    '<>'(a: MaybeBox<T>, b: MaybeBox<T>): MaybeBox<T>
    mappend(a: MaybeBox<T>, b: MaybeBox<T>): MaybeBox<T>
    mconcat(_: List<MaybeBox<T>>): MaybeBox<T>
}

const base = <T>(baseSemigroup: Semigroup<T>): MonoidBase<MaybeBox<T>> => ({
    ...semigroup(baseSemigroup),
    mempty: nothing(),
})

export const monoid = <T>(baseSemigroup: Semigroup<T>): MaybeMonoid<T> => {
    const baseMonoid = base(baseSemigroup)
    return createMonoid(baseMonoid) as MaybeMonoid<T>
}
