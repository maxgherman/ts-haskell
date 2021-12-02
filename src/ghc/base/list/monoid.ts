// instance Monoid [a] -- Defined in ‘GHC.Base’

import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'
import { semigroup } from './semigroup'
import { List, nil, ListBox } from 'ghc/base/list/list'

export interface MonoidList<T> extends Monoid<ListBox<T>> {
    readonly mempty: ListBox<T>
    '<>'(a: ListBox<T>, b: ListBox<T>): ListBox<T>
    mappend(a: ListBox<T>, b: ListBox<T>): ListBox<T>
    mconcat: (_: List<ListBox<T>>) => ListBox<T>
}

const base = <T>(): MonoidBase<ListBox<T>> => ({
    ...semigroup<T>(),
    mempty: nil(),
})

export const monoid = <T>(): MonoidList<T> => {
    return createMonoid(base<T>()) as MonoidList<T>
}
