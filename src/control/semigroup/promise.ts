import { ISemigroup, semigroup as baseSemigroup }  from '@control/common/semigroup'
import { IsPromise, PromiseBox } from '@common/types/promise-box'

export interface IPromiseSemigroup extends ISemigroup<IsPromise> {
    '<>'<A>(a: PromiseBox<A>, b: PromiseBox<A>): PromiseBox<A>
}

const implementation = <T>(innerSemigroup: ISemigroup<T>) => ({
    '<>'<A>(a: PromiseBox<A>, b: PromiseBox<A>): PromiseBox<A> {
        a = a || Promise.resolve()
        b = b || Promise.resolve()

        return Promise.all([a, b] as (PromiseLike<A>[]))
            .then(([result1, result2]) =>
                innerSemigroup['<>'](result1, result2)
            ) as Promise<A>
    }
})

export const semigroup = <T, K extends ISemigroup<T>>
    (innerSemigroup: K): IPromiseSemigroup =>
    baseSemigroup(implementation(innerSemigroup)) as IPromiseSemigroup
