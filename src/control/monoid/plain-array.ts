import { IMonoid, IMonoidBase, monoid as monoidBase } from '@common/types/monoid';
import { PlainArrayS } from '@control/semigroup/plain-array';
import { semigroup } from '@control/semigroup/plain-array';
import { IsPlainArray } from '@control/plain-array';

export interface IPlainArrayMonoid extends IMonoid<IsPlainArray> {
    mempty<A>(): PlainArrayS<A>;
    mappend<A>(a: PlainArrayS<A>, b: PlainArrayS<A>): PlainArrayS<A>;
    mconcat<A>(array: Array<PlainArrayS<A>>): PlainArrayS<A>;
}

const base: IMonoidBase<IsPlainArray> = {
    mempty<A>(): PlainArrayS<A> {
        return [];
    }

    // mconcat<A>(array: Array<PlainArrayS<A>>): PlainArrayS<A> {
    //     return array.reduce<PlainArrayS<A>>((acc, curr) => acc.concat(curr), []);
    // }
}

export const monoid: IPlainArrayMonoid = monoidBase(semigroup, base) as IPlainArrayMonoid;
