import { ISemigroup, semigroup as baseSemigroup }  from '@control/common/semigroup'
import { IsPlainArray, ArrayBox } from '@common/types/plain-array-box'

export interface IPlainArraySemigroup extends ISemigroup<IsPlainArray> {
    '<>'<A>(a: ArrayBox<A>, b: ArrayBox<A>): ArrayBox<A>
}

const base = {
    '<>'<A>(a: ArrayBox<A>, b: ArrayBox<A>) {
        a = a || []
        b = b || []

        return a.concat(b)
    }
}

export const semigroup = baseSemigroup(base) as IPlainArraySemigroup