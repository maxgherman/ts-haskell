import { IMonoid, IMonoidBase, monoid as monoidBase } from '@control/common/monoid';
import { semigroup } from '@control/semigroup/plain-array';
import { IsPlainArray, ArrayBox } from '@common/types/plain-array-box';

export interface IPlainArrayMonoid extends IMonoid<IsPlainArray> {
    mempty<A>(): ArrayBox<A>;
    mappend<A>(a: ArrayBox<A>, b: ArrayBox<A>): ArrayBox<A>;
    mconcat<A>(array: Array<ArrayBox<A>>): ArrayBox<A>;
    '<>'<A>(a: ArrayBox<A>, b: ArrayBox<A>): ArrayBox<A>;
}

const base: IMonoidBase<IsPlainArray> = {
    mempty<A>(): ArrayBox<A> {
        return [];
    }
}

export const monoid: IPlainArrayMonoid = monoidBase(semigroup, base) as IPlainArrayMonoid;
