import { ISemigroup }  from '@control/common/semigroup';
import { IsPromise, PromiseBox } from '@common/types/promise-box';

export interface IPromiseSemigroup extends ISemigroup<IsPromise> {
    '<>'<A>(a: PromiseBox<A>, b: PromiseBox<A>): PromiseBox<A>;
}

export const semigroup = (baseSemigroup: ISemigroup<IsPromise>): IPromiseSemigroup => ({
    '<>'<A>(a: PromiseBox<A>, b: PromiseBox<A>): PromiseBox<A> {
        a = a || Promise.resolve();
        b = b || Promise.resolve();

        return Promise.all([a, b] as (PromiseLike<A>[]))
            .then(([result1, result2]) =>
                baseSemigroup["<>"](result1, result2)
            ) as Promise<A>;
    }
});