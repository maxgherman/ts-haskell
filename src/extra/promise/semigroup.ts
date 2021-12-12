import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { NonEmpty } from 'ghc/base/non-empty/list'
import { PromiseBox } from './promise'

export interface PromiseSemigroup<T> extends Semigroup<PromiseBox<T>> {
    '<>'(a: PromiseBox<T>, b: PromiseBox<T>): PromiseBox<T>
    sconcat(value: NonEmpty<PromiseBox<T>>): PromiseBox<T>
    stimes(b: number, a: PromiseBox<T>): PromiseBox<T>
}

const base = <T extends Semigroup<T>>(innerSemigroup: Semigroup<T>): SemigroupBase<PromiseBox<T>> => ({
    '<>'(a: PromiseBox<T>, b: PromiseBox<T>): PromiseBox<T> {
        return Promise.all([a, b]).then(([a, b]) => innerSemigroup['<>'](a, b)) as PromiseBox<T>
    },
})

export const semigroup = <T>(innerSemigroup: Semigroup<T>) =>
    createSemigroup(base(innerSemigroup)) as PromiseSemigroup<T>
