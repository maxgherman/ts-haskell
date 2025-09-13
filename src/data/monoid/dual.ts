import { Box1, Type, MinBox0 } from 'data/kind'
import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'

export type DualBox<T> = Box1<T> & { readonly value: MinBox0<T> }

export const dual = <T>(x: MinBox0<T>): DualBox<T> => ({
    value: x,
    kind: (_: '*') => '*' as Type,
})

export const getDual = <T>(d: DualBox<T>): MinBox0<T> => d.value

export const semigroup = <T>(s: Semigroup<T>) => {
    const base: SemigroupBase<DualBox<T>> = {
        '<>': (a: DualBox<T>, b: DualBox<T>): DualBox<T> => dual<T>(s['<>'](b.value, a.value)),
    }
    return createSemigroup(base) as Semigroup<DualBox<T>>
}

export const monoid = <T>(m: Monoid<T>) => {
    const base: MonoidBase<DualBox<T>> = {
        ...semigroup<T>(m),
        mempty: dual<T>(m.mempty),
    }
    return createMonoid(base) as Monoid<DualBox<T>>
}
