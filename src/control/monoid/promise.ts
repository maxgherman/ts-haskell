import { IMonoid, IMonoidBase, monoid as monoidBase } from '@control/common/monoid'
import { semigroup as baseSemigroup } from '@control/semigroup/promise'
import { IsPromise, PromiseBox } from '@common/types/promise-box'

export interface IPromiseMonoid extends IMonoid<IsPromise> {
    mempty<A>(): PromiseBox<A>
    mappend<A>(a: PromiseBox<A>, b: PromiseBox<A>): PromiseBox<A>
    mconcat<A>(array: PromiseBox<A>[]): PromiseBox<A>
    '<>'<A>(a: PromiseBox<A>, b: PromiseBox<A>): PromiseBox<A>
}

const base = <T, K extends IMonoid<T>>(baseTypeMonoid: K): IMonoidBase<IsPromise> => ({
    mempty: <A>() =>
        Promise.resolve(baseTypeMonoid.mempty() as A),

    mconcat<A>(array: PromiseBox<A>[]): PromiseBox<A> {
        array = array || ([] as PromiseBox<A>[])

        return Promise.all(array as PromiseLike<A>[])
        .then((values) =>
            baseTypeMonoid.mconcat(values)
        ) as PromiseBox<A>
    }
})

export const monoid = <T, K extends IMonoid<T>>(baseTypeMonoid: K): IPromiseMonoid => {
    const semigroup = baseSemigroup(baseTypeMonoid)

    return monoidBase(semigroup, base<T, K>(baseTypeMonoid)) as IPromiseMonoid
}
