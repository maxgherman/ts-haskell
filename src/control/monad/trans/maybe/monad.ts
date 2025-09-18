import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative as createApplicative } from './applicative'
import { MaybeTBox, maybeT } from './maybe-t'
import { MaybeBox, $case, nothing } from 'ghc/base/maybe/maybe'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface MaybeTMonad extends Monad {
    '>>='<A, B>(ma: MaybeTBox<A>, f: FunctionArrow<A, MaybeTBox<B>>): MaybeTBox<B>

    '>>'<A, B>(ma: MaybeTBox<A>, mb: MaybeTBox<B>): MaybeTBox<B>

    return<A>(a: NonNullable<A>): MaybeTBox<A>

    pure<A>(a: NonNullable<A>): MaybeTBox<A>

    '<*>'<A, B>(f: MaybeTBox<FunctionArrow<A, B>>, fa: MaybeTBox<A>): MaybeTBox<B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: MaybeTBox<A>, fb: MaybeTBox<B>): MaybeTBox<C>

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

const baseImplementation = (m: Monad) => ({
    '>>=': <A, B>(ma: MaybeTBox<A>, f: FunctionArrow<A, MaybeTBox<B>>): MaybeTBox<B> =>
        maybeT(() =>
            m['>>='](
                ma.runMaybeT(),
                (mb: MaybeBox<A>): ReturnType<typeof m.return> =>
                    $case<A, ReturnType<typeof m.return>>({
                        just: (x: A) => f(x).runMaybeT(),
                        nothing: () => m.pure(nothing<B>() as MaybeBox<B>),
                    })(mb),
            ),
        ),
})

export const monad = (m: Monad): MaybeTMonad => {
    const base = baseImplementation(m)
    const app = createApplicative(m)
    return createMonad(base, app) as MaybeTMonad
}
