import { ISemigroup }  from '@common/types/semigroup';
import { IsPlainArray, ArrayBox } from '@control/plain-array';

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