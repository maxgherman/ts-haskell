import { MinBox1 } from 'data/kind'
import { Functor } from 'ghc/base/functor'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { id, $const } from 'ghc/base/functions'

export type ApplicativeBase = Functor & {
    // embed pure expressions
    // pure :: Functor f => a -> f a
    pure<A>(a: NonNullable<A>): MinBox1<A>

    // sequential computation
    // (<*>) :: Functor f => f (a -> b) -> f a -> f b
    '<*>'<A, B>(f: MinBox1<FunctionArrow<A, B>>, fa: MinBox1<A>): MinBox1<B>

    // liftA2 :: Functor f => (a -> b -> c) -> f a -> f b -> f c
    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<C>
}

export type Applicative = ApplicativeBase & {
    // (*>) :: Functor f => f a -> f b -> f b
    '*>'<A, B>(fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<B>

    // (<*) :: Functor f => f a -> f b -> f a
    '<*'<A, B>(fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<A>

    // (<**>) :: Functor f => f a -> f (a -> b) -> f b
    '<**>'<A, B>(fa: MinBox1<A>, f: MinBox1<FunctionArrow<A, B>>): MinBox1<B>
}

export type BaseImplementation = Pick<ApplicativeBase, 'pure'> &
    Partial<Pick<ApplicativeBase, '<*>' | 'liftA2'>> &
    (Pick<ApplicativeBase, '<*>'> | Pick<ApplicativeBase, 'liftA2'>)

const extensions = (base: ApplicativeBase) => {
    return {
        // u *> v = (id <$ u) <*> v
        '*>': <A, B>(fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<B> => base['<*>'](base['<$'](id, fa), fb),

        // u <* v = liftA2 const u v
        '<*': <A, B>(fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<A> => base.liftA2($const, fa, fb),

        // (<**>) = liftA2 (\a f -> f a)
        '<**>': <A, B>(fa: MinBox1<A>, f: MinBox1<FunctionArrow<A, B>>): MinBox1<B> =>
            base.liftA2(
                <A, C>(a: A) =>
                    (b: (_: A) => C) =>
                        b(a) as C,
                fa,
                f,
            ),
    }
}

export const applicative = (base: BaseImplementation, fBase: Functor): Applicative => {
    const star = base['<*>']
    const lift = base.liftA2

    const applicativeBase = {
        ...fBase,
        ...base,
        '<*>': star,
        liftA2: lift,
    } as ApplicativeBase

    if (star && !lift) {
        // liftA2 f x y = f <$> x <*> y
        applicativeBase.liftA2 = <A, B, C>(f: FunctionArrow2<A, B, C>, fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<C> =>
            star(fBase['<$>'](f, fa), fb)
    }

    if (!star && lift) {
        // (<*>) = liftA2 id
        // liftA2 f x y = f <$> x <*> y
        applicativeBase['<*>'] = <A, B>(f: MinBox1<FunctionArrow<A, B>>, fa: MinBox1<A>): MinBox1<B> => lift(id, f, fa)
    }

    return {
        ...applicativeBase,
        ...extensions(applicativeBase),
    }
}
