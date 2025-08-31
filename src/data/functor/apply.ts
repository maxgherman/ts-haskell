import { MinBox1 } from 'data/kind'
import { Functor } from 'ghc/base/functor'
import { Applicative, applicative as createApplicative } from 'ghc/base/applicative'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { id, $const } from 'ghc/base/functions'

// Apply: Functor with application, but without pure
export type ApplyBase = Functor & {
    '<*>'<A, B>(f: MinBox1<FunctionArrow<A, B>>, fa: MinBox1<A>): MinBox1<B>
    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<C>
}

export type Apply = ApplyBase & {
    '*>'<A, B>(fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<B>
    '<*'<A, B>(fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<A>
    '<**>'<A, B>(fa: MinBox1<A>, f: MinBox1<FunctionArrow<A, B>>): MinBox1<B>
}

export type BaseImplementation = Partial<Pick<ApplyBase, '<*>' | 'liftA2'>> &
    (Pick<ApplyBase, '<*>'> | Pick<ApplyBase, 'liftA2'>)

const extensions = (base: ApplyBase) => ({
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
})

export const apply = (base: BaseImplementation, fBase: Functor): Apply => {
    const star = base['<*>']
    const lift = base.liftA2

    const applyBase = {
        ...fBase,
        ...base,
        '<*>': star,
        liftA2: lift,
    } as ApplyBase

    if (star && !lift) {
        // liftA2 f x y = f <$> x <*> y
        applyBase.liftA2 = <A, B, C>(f: FunctionArrow2<A, B, C>, fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<C> =>
            star(fBase['<$>'](f, fa), fb)
    }

    if (!star && lift) {
        // (<*>) = liftA2 id
        applyBase['<*>'] = <A, B>(f: MinBox1<FunctionArrow<A, B>>, fa: MinBox1<A>): MinBox1<B> => lift(id, f, fa)
    }

    return {
        ...applyBase,
        ...extensions(applyBase),
    }
}

// Helper: derive Apply from an existing Applicative (drops pure)
export const fromApplicative = (app: Applicative): Apply => apply({ '<*>': app['<*>'], liftA2: app.liftA2 }, app)

// Helper: construct an Applicative from an Apply and a `pure`
export const toApplicative = (ap: Apply, pure: <A>(a: NonNullable<A>) => MinBox1<A>): Applicative =>
    createApplicative({ pure, '<*>': ap['<*>'], liftA2: ap.liftA2 }, ap)
