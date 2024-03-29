// instance (Semigroup a, Semigroup b) => Semigroup (a, b) -- Defined in ‘GHC.Base’

import { extensions, Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { fst, snd, tuple2, TupleMinBox } from './tuple'
import { NonEmpty } from 'ghc/base/non-empty/list'

export interface Tuple2Semigroup<T1, T2> extends Semigroup<TupleMinBox<T1, T2>> {
    '<>'(a: TupleMinBox<T1, T2>, b: TupleMinBox<T1, T2>): TupleMinBox<T1, T2>

    sconcat(value: NonEmpty<TupleMinBox<T1, T2>>): TupleMinBox<T1, T2>
    stimes(b: number, a: TupleMinBox<T1, T2>): TupleMinBox<T1, T2>
}

const base = <T1, T2>(
    innerSemigroup1: Semigroup<T1>,
    innerSemigroup2: Semigroup<T2>,
): SemigroupBase<TupleMinBox<T1, T2>> => ({
    '<>'(a: TupleMinBox<T1, T2>, b: TupleMinBox<T1, T2>): TupleMinBox<T1, T2> {
        const a1 = fst(a)
        const a2 = snd(a)
        const b1 = fst(b)
        const b2 = snd(b)

        return tuple2(innerSemigroup1['<>'](a1, b1), innerSemigroup2['<>'](a2, b2))
    },
})

const stimesTuple2 =
    <T1, T2>(innerSemigroup1: Semigroup<T1>, innerSemigroup2: Semigroup<T2>) =>
    (b: number, a: TupleMinBox<T1, T2>) =>
        tuple2(innerSemigroup1.stimes(b, fst(a)), innerSemigroup2.stimes(b, snd(a)))

export const semigroup = <T1, T2>(
    innerSemigroup1: Semigroup<T1>,
    innerSemigroup2: Semigroup<T2>,
): Tuple2Semigroup<T1, T2> => {
    const _base = base(innerSemigroup1, innerSemigroup2)
    const baseExtensions = extensions(_base)

    const overrides = {
        ...baseExtensions,
        stimes: stimesTuple2(innerSemigroup1, innerSemigroup2),
    }

    return createSemigroup(_base, overrides) as Tuple2Semigroup<T1, T2>
}
