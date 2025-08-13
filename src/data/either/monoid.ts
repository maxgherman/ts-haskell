// instance Monoid a => Monoid (Either a b) -- Defined in `Data.Either`

import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'
import { semigroup as createSemigroup } from 'ghc/base/semigroup'
import type { MinBox0 } from 'data/kind'
import { $case, left, right, EitherBox } from './either'
import type { List } from 'ghc/base/list/list'

export interface EitherMonoid<T1, T2> extends Monoid<EitherBox<T1, T2>> {
    readonly mempty: EitherBox<T1, T2>
    '<>'(a: EitherBox<T1, T2>, b: EitherBox<T1, T2>): EitherBox<T1, T2>
    mappend(a: EitherBox<T1, T2>, b: EitherBox<T1, T2>): EitherBox<T1, T2>
    mconcat(_: List<EitherBox<T1, T2>>): EitherBox<T1, T2>
}

const semigroupBase = <T1, T2>(leftMonoid: Monoid<T1>) => ({
    '<>'(a: EitherBox<T1, T2>, b: EitherBox<T1, T2>): EitherBox<T1, T2> {
        return $case<T1, T2, EitherBox<T1, T2>>({
            left: (x1: T1) =>
                $case<T1, T2, EitherBox<T1, T2>>({
                    left: (x2: T1) =>
                        left<T1, T2>(
                            leftMonoid['<>'](x1 as MinBox0<T1>, x2 as MinBox0<T1>) as unknown as NonNullable<T1>,
                        ),
                    right: (y2: T2) => right<T1, T2>(y2 as NonNullable<T2>),
                })(b),
            right: (y1: T2) => right<T1, T2>(y1 as NonNullable<T2>),
        })(a)
    },
})

const base = <T1, T2>(leftMonoid: Monoid<T1>): MonoidBase<EitherBox<T1, T2>> => ({
    ...createSemigroup(semigroupBase<T1, T2>(leftMonoid)),
    mempty: left<T1, T2>(leftMonoid.mempty as unknown as NonNullable<T1>),
})

export const monoid = <T1, T2>(leftMonoid: Monoid<T1>) => createMonoid(base<T1, T2>(leftMonoid)) as EitherMonoid<T1, T2>
