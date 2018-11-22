import { IMonoid, IMonoidBase, monoid as monoidBase } from '@control/common/monoid';
import { semigroup as baseSemigroup } from '@control/semigroup/promise';
import { IsPromise, PromiseBox } from '@common/types/promise-box';

export interface IPromiseMonoid extends IMonoid<IsPromise> {
    mempty<A>(): PromiseBox<A>;
    mappend<A>(a: PromiseBox<A>, b: PromiseBox<A>): PromiseBox<A>;
    mconcat<A>(array: Array<PromiseBox<A>>): PromiseBox<A>;
    '<>'<A>(a: PromiseBox<A>, b: PromiseBox<A>): PromiseBox<A>;
}

const base = (baseTypeMonoid: IMonoid<IsPromise>): IMonoidBase<IsPromise> => ({
    mempty: <A>() =>
        Promise.resolve(baseTypeMonoid.mempty() as A),

        mconcat<A>(array: Array<PromiseBox<A>>): PromiseBox<A> {
            array = array || ([this.mempty()] as Array<PromiseBox<A>>);

            return Promise.all(array as PromiseLike<A>[])
            .then((values) => {
                return baseTypeMonoid.mconcat(values);
            }) as PromiseBox<A>;
        }
});

export const monoid = (baseTypeMonoid: IMonoid<IsPromise>): IPromiseMonoid => {
    const semigroup = baseSemigroup(baseTypeMonoid); 
    
    return monoidBase(semigroup, base(baseTypeMonoid)) as IPromiseMonoid;
}