import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'
import { PromiseBox } from './promise'
import { List } from 'ghc/base/list/list'

export interface PromiseMonoid<T> extends Monoid<PromiseBox<T>> {
    readonly mempty: PromiseBox<T>
    '<>'(a: PromiseBox<T>, b: PromiseBox<T>): PromiseBox<T>
    mappend(a: PromiseBox<T>, b: PromiseBox<T>): PromiseBox<T>
    mconcat: (_: List<PromiseBox<T>>) => PromiseBox<T>
}

const base = <T>(innerMonoid: Monoid<T>): MonoidBase<PromiseBox<T>> => ({
    ...innerMonoid,

    '<>': (a: PromiseBox<T>, b: PromiseBox<T>) =>
        Promise.all([a, b]).then(([a, b]) => innerMonoid['<>'](a, b)) as PromiseBox<T>,

    mempty: Promise.resolve(innerMonoid.mempty as PromiseBox<T>) as PromiseBox<T>,
})

export const monoid = <T>(innerMonoid: Monoid<T>): PromiseMonoid<T> => {
    return createMonoid(base(innerMonoid)) as PromiseMonoid<T>
}
