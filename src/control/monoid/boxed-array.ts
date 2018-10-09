import { BoxedArray } from '@data/boxed-array';
import { IMonoid, IMonoidBase, monoid as monoidBase } from '@control/common/monoid';
import { semigroup } from '@control/semigroup/boxed-array';
import { IsBoxedArray, BoxedArrayBox } from '@common/types/boxed-array-box';

export interface IBoxedArrayMonoid extends IMonoid<IsBoxedArray> {
    mempty<A>(): BoxedArrayBox<A>;
    mappend<A>(a: BoxedArrayBox<A>, b: BoxedArrayBox<A>): BoxedArrayBox<A>;
    mconcat<A>(array: Array<BoxedArrayBox<A>>): BoxedArrayBox<A>;
    '<>'<A>(a: BoxedArrayBox<A>, b: BoxedArrayBox<A>): BoxedArrayBox<A>;
}

const base: IMonoidBase<IsBoxedArray> = {
    mempty<A>(): BoxedArrayBox<A> {
        return BoxedArray.from([]);
    }
}

export const monoid: IBoxedArrayMonoid = monoidBase(semigroup, base) as IBoxedArrayMonoid;