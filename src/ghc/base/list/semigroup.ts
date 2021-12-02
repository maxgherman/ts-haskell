import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { NonEmpty } from 'ghc/base/non-empty/list'
import { concat, ListBox } from 'ghc/base/list/list'

export interface ListSemigroup<T> extends Semigroup<ListBox<T>> {
    '<>'(a: ListBox<T>, b: ListBox<T>): ListBox<T>
    sconcat(value: NonEmpty<ListBox<T>>): ListBox<T>
    stimes(b: number, a: ListBox<T>): ListBox<T>
}

const base = <T>(): SemigroupBase<ListBox<T>> => ({
    '<>': concat as (a: ListBox<T>, b: ListBox<T>) => ListBox<T>,
})

export const semigroup = <T>() => createSemigroup(base<T>()) as ListSemigroup<T>
