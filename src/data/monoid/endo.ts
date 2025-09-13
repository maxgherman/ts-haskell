import { FunctionArrow, FunctionArrowBox, withKind } from 'ghc/prim/function-arrow'
import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { Monoid, monoid as createMonoid, MonoidBase } from 'ghc/base/monoid'
import { id } from 'ghc/base/functions'

export type EndoBox<A> = FunctionArrowBox<A, A>

export const endo = <A>(f: FunctionArrow<A, A>): EndoBox<A> => withKind(f)

export const appEndo = <A>(e: EndoBox<A>, a: A): A => e(a)

export const semigroup = <A>() => {
    const base: SemigroupBase<EndoBox<A>> = {
        '<>': (f: EndoBox<A>, g: EndoBox<A>): EndoBox<A> => endo<A>((x: A) => f(g(x))),
    }
    return createSemigroup(base) as Semigroup<EndoBox<A>>
}

export const monoid = <A>() => {
    const base: MonoidBase<EndoBox<A>> = {
        ...semigroup<A>(),
        mempty: endo<A>(id as unknown as (_: A) => A),
    }
    return createMonoid(base) as Monoid<EndoBox<A>>
}
