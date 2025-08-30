import { Box2, Kind, Constraint } from 'data/kind'

export type BifunctorBase = {
    // bimap :: Bifunctor p => (a -> c) -> (b -> d) -> p a b -> p c d
    bimap<A, B, C, D>(f: (a: A) => C, g: (b: B) => D, pab: Box2<A, B>): Box2<C, D>
}

export type Bifunctor = BifunctorBase & {
    // first :: Bifunctor p => (a -> c) -> p a b -> p c b
    first<A, B, C>(f: (a: A) => C, pab: Box2<A, B>): Box2<C, B>

    // second :: Bifunctor p => (b -> d) -> p a b -> p a d
    second<A, B, D>(g: (b: B) => D, pab: Box2<A, B>): Box2<A, D>

    kind: (_: (_: '*') => (_: '*') => '*') => Constraint
}

type Extensions = Omit<Bifunctor, 'bimap' | 'kind'>

export const kindOf =
    (_: Bifunctor): Kind =>
    (_: (_: '*') => (_: '*') => '*') =>
        'Constraint' as Constraint

const extensions: (_: BifunctorBase) => Extensions = (base: BifunctorBase) => {
    return {
        first: <A, B, C>(f: (a: A) => C, pab: Box2<A, B>): Box2<C, B> =>
            base.bimap(f, (b: B) => b, pab) as unknown as Box2<C, B>,

        second: <A, B, D>(g: (b: B) => D, pab: Box2<A, B>): Box2<A, D> =>
            base.bimap((a: A) => a, g, pab) as unknown as Box2<A, D>,
    }
}

export const bifunctor = (base: BifunctorBase): Bifunctor => {
    const extended = extensions(base)

    const result: Bifunctor = {
        ...base,
        ...extended,
        kind: kindOf(null as unknown as Bifunctor) as (_: (_: '*') => (_: '*') => '*') => 'Constraint',
    }

    return result
}
