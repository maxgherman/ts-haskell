import { Box2, Kind, Constraint, MinBox0 } from 'data/kind'
import { Monoid } from 'ghc/base/monoid'
import { id } from 'ghc/base/functions'
import { monoid as endoMonoid, endo, appEndo, EndoBox } from 'data/monoid/endo'
import { monoid as dualMonoid, dual, getDual, DualBox } from 'data/monoid/dual'
import { monoid as anyMonoid, any, getAny, AnyBox } from 'data/monoid/any'
import { monoid as allMonoid, all, getAll, AllBox } from 'data/monoid/all'
import { monoid as sumMonoid, sum, getSum, SumBox } from 'data/monoid/sum'
import { monoid as productMonoid, product, getProduct, ProductBox } from 'data/monoid/product'

export type BiFoldableBase = {
    bifoldMap<A, B, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, g: (b: B) => MinBox0<M>, fab: Box2<A, B>): MinBox0<M>
}

export type BiFoldable = BiFoldableBase & {
    bifold<M>(m: Monoid<M>, fab: Box2<MinBox0<M>, MinBox0<M>>): MinBox0<M>
    bifoldr<A, B, C>(f: (a: A, c: C) => C, g: (b: B, c: C) => C, c: C, fab: Box2<A, B>): C
    "bifoldr'"<A, B, C>(f: (a: A, c: C) => C, g: (b: B, c: C) => C, c: C, fab: Box2<A, B>): C
    bifoldl<A, B, C>(f: (c: C, a: A) => C, g: (c: C, b: B) => C, c: C, fab: Box2<A, B>): C
    "bifoldl'"<A, B, C>(f: (c: C, a: A) => C, g: (c: C, b: B) => C, c: C, fab: Box2<A, B>): C
    biany<A, B>(f: (a: A) => boolean, g: (b: B) => boolean, fab: Box2<A, B>): boolean
    biall<A, B>(f: (a: A) => boolean, g: (b: B) => boolean, fab: Box2<A, B>): boolean
    bisum<A, B>(fab: Box2<A, B>): number
    biproduct<A, B>(fab: Box2<A, B>): number
    kind: (_: (_: '*') => (_: '*') => '*') => Constraint
}

export type Overrides = Partial<Omit<BiFoldable, keyof BiFoldableBase | 'kind'>>

export const kindOf =
    (_: BiFoldable): Kind =>
    (_: (_: '*') => (_: '*') => '*') =>
        'Constraint' as Constraint

const extensions = (base: BiFoldableBase): Omit<BiFoldable, keyof BiFoldableBase | 'kind'> => {
    const ext: Omit<BiFoldable, keyof BiFoldableBase | 'kind'> = {
        bifold: <M>(m: Monoid<M>, fab: Box2<MinBox0<M>, MinBox0<M>>): MinBox0<M> => base.bifoldMap(m, id, id, fab),

        bifoldr: <A, B, C>(f: (a: A, c: C) => C, g: (b: B, c: C) => C, c: C, fab: Box2<A, B>): C => {
            const endoM = endoMonoid<C>()
            const mapped = base.bifoldMap<A, B, EndoBox<C>>(
                endoM,
                (a: A) => endo<C>((acc: C) => f(a, acc)),
                (b: B) => endo<C>((acc: C) => g(b, acc)),
                fab,
            ) as unknown as EndoBox<C>
            return appEndo(mapped, c)
        },

        "bifoldr'": <A, B, C>(f: (a: A, c: C) => C, g: (b: B, c: C) => C, c: C, fab: Box2<A, B>): C =>
            ext.bifoldr(f, g, c, fab),

        bifoldl: <A, B, C>(f: (c: C, a: A) => C, g: (c: C, b: B) => C, c: C, fab: Box2<A, B>): C => {
            const endoM = endoMonoid<C>()
            const dualM = dualMonoid<EndoBox<C>>(endoM)
            const mapped = base.bifoldMap<A, B, DualBox<EndoBox<C>>>(
                dualM,
                (a: A) => dual<EndoBox<C>>(endo<C>((acc: C) => f(acc, a))),
                (b: B) => dual<EndoBox<C>>(endo<C>((acc: C) => g(acc, b))),
                fab,
            ) as unknown as DualBox<EndoBox<C>>
            return appEndo(getDual(mapped) as unknown as EndoBox<C>, c)
        },

        "bifoldl'": <A, B, C>(f: (c: C, a: A) => C, g: (c: C, b: B) => C, c: C, fab: Box2<A, B>): C =>
            ext.bifoldl(f, g, c, fab),

        biany: <A, B>(f: (a: A) => boolean, g: (b: B) => boolean, fab: Box2<A, B>): boolean => {
            const anyM = anyMonoid()
            const result = base.bifoldMap<A, B, AnyBox>(
                anyM,
                (a: A) => any(Boolean(f(a)) as NonNullable<boolean>),
                (b: B) => any(Boolean(g(b)) as NonNullable<boolean>),
                fab,
            ) as unknown as AnyBox
            return getAny(result)
        },

        biall: <A, B>(f: (a: A) => boolean, g: (b: B) => boolean, fab: Box2<A, B>): boolean => {
            const allM = allMonoid()
            const result = base.bifoldMap<A, B, AllBox>(
                allM,
                (a: A) => all(Boolean(f(a)) as NonNullable<boolean>),
                (b: B) => all(Boolean(g(b)) as NonNullable<boolean>),
                fab,
            ) as unknown as AllBox
            return getAll(result)
        },

        bisum: <A extends number, B extends number>(fab: Box2<A, B>): number => {
            const sumM = sumMonoid()
            const result = base.bifoldMap<A, B, SumBox>(
                sumM,
                (a: A) => sum(a as NonNullable<number>),
                (b: B) => sum(b as NonNullable<number>),
                fab,
            ) as unknown as SumBox
            return getSum(result)
        },

        biproduct: <A extends number, B extends number>(fab: Box2<A, B>): number => {
            const productM = productMonoid()
            const result = base.bifoldMap<A, B, ProductBox>(
                productM,
                (a: A) => product(a as NonNullable<number>),
                (b: B) => product(b as NonNullable<number>),
                fab,
            ) as unknown as ProductBox
            return getProduct(result)
        },
    }

    return ext
}

export const bifoldable = (base: BiFoldableBase, overrides: Overrides = {}): BiFoldable => {
    const result = {
        ...base,
        ...extensions(base),
        ...overrides,
        kind: kindOf(null as unknown as BiFoldable) as (_: (_: '*') => (_: '*') => '*') => 'Constraint',
    }

    return result as BiFoldable
}
