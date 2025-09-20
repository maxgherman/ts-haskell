import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import type { Monad } from 'ghc/base/monad/monad'
import { MaybeBox, just } from 'ghc/base/maybe/maybe'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { MaybeTBox, maybeT } from './maybe-t'
import { functor as createFunctor } from './functor'

export interface MaybeTApplicative extends Applicative {
    pure<A>(a: A): MaybeTBox<A>

    '<*>'<A, B>(f: MaybeTBox<FunctionArrow<A, B>>, fa: MaybeTBox<A>): MaybeTBox<B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, NonNullable<C>>, fa: MaybeTBox<A>, fb: MaybeTBox<B>): MaybeTBox<C>

    '*>'<A, B>(fa: MaybeTBox<A>, fb: MaybeTBox<B>): MaybeTBox<B>

    '<*'<A, B>(fa: MaybeTBox<A>, fb: MaybeTBox<B>): MaybeTBox<A>

    '<**>'<A, B>(fa: MaybeTBox<A>, f: MaybeTBox<FunctionArrow<A, B>>): MaybeTBox<B>

    fmap<A, B>(f: (a: A) => B, fa: MaybeTBox<A>): MaybeTBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: MaybeTBox<A>): MaybeTBox<B>

    '<$'<A, B>(a: A, fb: MaybeTBox<B>): MaybeTBox<A>

    '$>'<A, B>(fa: MaybeTBox<A>, b: B): MaybeTBox<B>

    '<&>'<A, B>(fa: MaybeTBox<A>, f: (a: A) => B): MaybeTBox<B>

    void<A>(fa: MaybeTBox<A>): MaybeTBox<[]>
}

const baseImpl = (m: Monad): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): MaybeTBox<A> => maybeT(() => m.pure(just(a) as MaybeBox<A>)),

    '<*>': <A, B>(f: MaybeTBox<FunctionArrow<A, B>>, fa: MaybeTBox<A>): MaybeTBox<B> =>
        maybeT(() =>
            m['<*>'](
                m['<$>'](
                    (mf: MaybeBox<FunctionArrow<A, B>>) => (ma: MaybeBox<A>) =>
                        maybeApplicative['<*>'](mf, ma) as MaybeBox<B>,
                    f.runMaybeT(),
                ),
                fa.runMaybeT(),
            ),
        ),

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, NonNullable<C>>, fa: MaybeTBox<A>, fb: MaybeTBox<B>): MaybeTBox<C> =>
        maybeT(() =>
            m.liftA2(
                (ma: MaybeBox<A>) => (mb: MaybeBox<B>) => maybeApplicative.liftA2(f, ma, mb),
                fa.runMaybeT(),
                fb.runMaybeT(),
            ),
        ),
})

export const applicative = (m: Monad): MaybeTApplicative => {
    const functor = createFunctor(m)
    return createApplicative(baseImpl(m), functor) as MaybeTApplicative
}
