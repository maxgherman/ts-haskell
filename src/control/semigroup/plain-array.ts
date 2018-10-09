import { ISemigroup }  from '@control/common/semigroup';
import { IsPlainArray, ArrayBox } from '@common/types/plain-array-box';

export interface IPlainArraySemigroup extends ISemigroup<IsPlainArray> {
    '<>'<A>(a: ArrayBox<A>, b: ArrayBox<A>): ArrayBox<A>;
}

export const semigroup: IPlainArraySemigroup = {
    '<>'<A>(a: ArrayBox<A>, b: ArrayBox<A>) {
        a = a || [];
        b = b || [];

        return a.concat(b);
    }
}