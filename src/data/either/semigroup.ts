// instance Semigroup (Either a b) -- Defined in ‘Data.Either’

import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { NonEmpty } from 'ghc/base/non-empty/list'
import { $case, EitherBox, right } from './either'

export interface EitherSemigroup<T1, T2> extends Semigroup<EitherBox<T1, T2>> {
    '<>'(a: EitherBox<T1, T2>, b: EitherBox<T1, T2>): EitherBox<T1, T2>
    sconcat(value: NonEmpty<EitherBox<T1, T2>>): EitherBox<T1, T2>
    stimes(b: number, a: EitherBox<T1, T2>): EitherBox<T1, T2>
}

const base = <T1, T2>(): SemigroupBase<EitherBox<T1, T2>> => ({
    '<>'(a: EitherBox<T1, T2>, b: EitherBox<T1, T2>): EitherBox<T1, T2> {
        return $case({
            left: () => b,
            right: (x: T2) => right<T1, T2>(x as NonNullable<T2>) as EitherBox<T1, T2>,
        })(a)
    },
})

const stimesEither = <T1, T2>(n: number, x: EitherBox<T1, T2>) => {
    if (n < 0) {
        throw new Error('stimes: positive multiplier expected')
    }

    return x
}

export const semigroup = <T1, T2>() => {
    const _base = base<T1, T2>()

    const overrides = {
        ..._base,
        stimes: stimesEither,
    }

    return createSemigroup(_base, overrides) as EitherSemigroup<T1, T2>
}
