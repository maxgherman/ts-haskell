import { Box } from '@common/types/box';
import { ISemigroup }  from '@common/types/semigroup';
import {IsPlainArray } from '@control/plain-array';

export type PlainArrayS<T> = Box<IsPlainArray, T> & Array<T> 

export interface IPlainArraySemigroup extends ISemigroup<IsPlainArray> {
    '<>'<A>(a: PlainArrayS<A>, b: PlainArrayS<A>): PlainArrayS<A>;
}

export const semigroup: IPlainArraySemigroup = {
    '<>'<A>(a: PlainArrayS<A>, b: PlainArrayS<A>) {
        a = a || [];
        b = b || [];

        return a.concat(b);
    }
}