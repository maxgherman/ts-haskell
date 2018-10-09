import { ISemigroup }  from '@control/common/semigroup';
import { BoxedArray } from '@data/boxed-array';
import { IsBoxedArray, BoxedArrayBox } from '@common/types/boxed-array-box';

export interface IBoxedArraySemigroup extends ISemigroup<IsBoxedArray> {
    '<>'<A>(a: BoxedArrayBox<A>, b: BoxedArrayBox<A>): BoxedArrayBox<A>;
}

export const semigroup: IBoxedArraySemigroup = {
    '<>'<A>(a: BoxedArrayBox<A>, b: BoxedArrayBox<A>) {
        a = a || BoxedArray.from([]);
        b = b || BoxedArray.from([]);

        return BoxedArray.from(a.value.concat(b.value));
    }
}