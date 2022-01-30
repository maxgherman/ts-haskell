// instance Monad Maybe -- Defined in ‘GHC.Base’

import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative } from 'ghc/base/maybe/applicative'
import { MaybeBox, $case, nothing } from 'ghc/base/maybe/maybe'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface MaybeMonad extends Monad {
    '>>='<A, B>(ma: MaybeBox<A>, f: FunctionArrow<A, MaybeBox<B>>): MaybeBox<B>

    '>>'<A, B>(ma: MaybeBox<A>, mb: MaybeBox<B>): MaybeBox<B>

    return<A>(a: NonNullable<A>): MaybeBox<A>

    pure<A>(a: NonNullable<A>): MaybeBox<A>

    '<*>'<A, B>(f: MaybeBox<FunctionArrow<A, B>>, fa: MaybeBox<A>): MaybeBox<B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<C>

    '*>'<A, B>(fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<B>

    '<*'<A, B>(fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<A>

    '<**>'<A, B>(fa: MaybeBox<A>, f: MaybeBox<FunctionArrow<A, B>>): MaybeBox<B>

    fmap<A, B>(f: (a: A) => B, fa: MaybeBox<A>): MaybeBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: MaybeBox<A>): MaybeBox<B>

    '<$'<A, B>(a: A, fb: MaybeBox<B>): MaybeBox<A>

    '$>'<A, B>(fa: MaybeBox<A>, b: B): MaybeBox<B>

    '<&>'<A, B>(fa: MaybeBox<A>, f: (a: A) => B): MaybeBox<B>

    void<A>(fa: MaybeBox<A>): MaybeBox<[]>
}

const baseImplementation = {
    '>>=': <A, B>(ma: MaybeBox<A>, f: FunctionArrow<A, MaybeBox<B>>): MaybeBox<B> =>
        $case<A, MaybeBox<B>>({
            just: (x) => f(x),
            nothing: () => nothing<B>(),
        })(ma),
}

export const monad = createMonad(baseImplementation, applicative) as MaybeMonad

// (>>) = (*>)
monad['>>'] = monad['*>']
