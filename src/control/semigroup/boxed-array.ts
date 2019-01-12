import { ISemigroup, semigroup as baseSemigroup }  from '@control/common/semigroup';
import { BoxedArray } from '@data/boxed-array';
import { IsBoxedArray, BoxedArrayBox } from '@common/types/boxed-array-box';

export interface IBoxedArraySemigroup extends ISemigroup<IsBoxedArray> {
    '<>'<A>(a: BoxedArrayBox<A>, b: BoxedArrayBox<A>): BoxedArrayBox<A>;
}

const base = {
    '<>'<A>(a: BoxedArrayBox<A>, b: BoxedArrayBox<A>) {
        a = a || BoxedArray.from([]);
        b = b || BoxedArray.from([]);

        return BoxedArray.from(a.value.concat(b.value));
    }
};

export const semigroup = baseSemigroup(base) as IBoxedArraySemigroup;