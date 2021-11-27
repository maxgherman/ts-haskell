import { MinBox1 } from 'data/kind'
import { $const, flip } from 'ghc/base/functions'

export type FMap = {
    // fmap :: Functor f => (a -> b) -> f a -> f b
    fmap<A, B>(f: (a: A) => B, fa: MinBox1<A>): MinBox1<B>
}

export type Extensions = {
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
}

export type Functor = FMap & Extensions

const extensions: (_: FMap) => Extensions = (base: FMap) => {
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

export const functor = (base: FMap): Functor => {
    const extended = extensions(base)

    return {
        ...base,
        ...extended,
    }
}
