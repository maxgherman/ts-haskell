import { compose } from 'ghc/base/functions'
import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { fromList, head, NonEmpty, NonEmptyBox, tail } from './list'
import { concat, cons, ListBox } from 'ghc/base/list/list'

export interface NonEmptySemigroup<T> extends Semigroup<NonEmptyBox<T>> {
    '<>'(a: NonEmptyBox<T>, b: NonEmptyBox<T>): NonEmptyBox<T>
    sconcat(value: NonEmpty<NonEmptyBox<T>>): NonEmptyBox<T>
    stimes(b: number, a: NonEmptyBox<T>): NonEmptyBox<T>
}

const base = <T>(): SemigroupBase<NonEmptyBox<T>> => ({
    '<>'(a: NonEmptyBox<T>, b: NonEmptyBox<T>): NonEmptyBox<T> {
        const headA = head(a)
        const headB = head(b)
        const tailA = tail(a)
        const tailB = tail(b)

        return compose(fromList, cons(headA), (x: ListBox<T>) => concat(tailA, x), cons(headB))(tailB) as NonEmptyBox<T>
    },
})

export const semigroup = <T>() => createSemigroup(base<T>()) as NonEmptySemigroup<T>
