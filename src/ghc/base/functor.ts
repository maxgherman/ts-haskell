import { MinBox1, Kind, Constraint } from 'data/kind'
import { $const, flip } from 'ghc/base/functions'

export type FunctorBase = {
    // fmap :: Functor f => (a -> b) -> f a -> f b
    fmap<A, B>(f: (a: A) => B, fa: MinBox1<A>): MinBox1<B>
}

export type Functor = FunctorBase & {
    // <$> :: Functor f => (a -> b) -> f a -> f b
    '<$>'<A, B>(f: (a: A) => B, fa: MinBox1<A>): MinBox1<B>

    // <$ :: Functor f => a -> f b -> f a
    '<$'<A, B>(a: A, fb: MinBox1<B>): MinBox1<A>

    // <$ :: Functor f => f a -> b -> f a
    '$>'<A, B>(fa: MinBox1<A>, b: B): MinBox1<B>

    // <&> :: Functor f => f a -> (a -> b) -> f b
    '<&>'<A, B>(fa: MinBox1<A>, f: (a: A) => B): MinBox1<B>

    // void :: Functor f => f a -> f ()
    void<A>(fa: MinBox1<A>): MinBox1<[]>

    kind: (_: (_: '*') => '*') => Constraint
}

type Extensions = Omit<Functor, 'fmap' | 'kind'>

export const kindOf =
    (_: Functor): Kind =>
    (_: (_: '*') => '*') =>
        'Constraint' as Constraint

const extensions: (_: FunctorBase) => Extensions = (base: FunctorBase) => {
    const fmapDotConst = (x: unknown, y: MinBox1<unknown>) => base.fmap($const(x), y)

    return {
        // <$> :: Functor f => (a -> b) ->  f a -> f b
        '<$>': base.fmap,

        // <$ :: Functor f => a -> f b -> f a
        '<$': fmapDotConst,

        // $> :: Functor f => f a -> b -> f a
        '$>': flip(fmapDotConst),

        // <&> :: Functor f => f a -> (a -> b) -> f b
        '<&>': flip(base.fmap),

        //  void :: Functor f => f a -> f ()
        void: <A>(fa: MinBox1<A>) => fmapDotConst([], fa),
    }
}

export const functor = (base: FunctorBase): Functor => {
    const extended = extensions(base)

    const result: Functor = {
        ...base,
        ...extended,
        kind: kindOf(null as unknown as Functor) as (_: (_: '*') => '*') => 'Constraint',
    }

    return result
}
