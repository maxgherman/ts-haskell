// instance Monad NonEmpty -- Defined in ‘GHC.Base’

import { compose } from 'ghc/base/functions'
import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative } from 'ghc/base/non-empty/applicative'
import { NonEmptyBox, toList, head, tail, cons, formList } from 'ghc/base/non-empty/list'
import { concat } from 'ghc/base/list/list'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { monad as listMonad } from 'ghc/base/list/monad'

export interface NonEmptyMonad extends Monad {
    '>>='<A, B>(ma: NonEmptyBox<A>, f: FunctionArrow<A, NonEmptyBox<B>>): NonEmptyBox<B>

    '>>'<A, B>(ma: NonEmptyBox<A>, mb: NonEmptyBox<B>): NonEmptyBox<B>

    return<A>(a: NonNullable<A>): NonEmptyBox<A>

    pure<A>(a: NonNullable<A>): NonEmptyBox<A>

    '<*>'<A, B>(f: NonEmptyBox<FunctionArrow<A, B>>, fa: NonEmptyBox<A>): NonEmptyBox<B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: NonEmptyBox<A>, fb: NonEmptyBox<B>): NonEmptyBox<C>

    '*>'<A, B>(fa: NonEmptyBox<A>, fb: NonEmptyBox<B>): NonEmptyBox<B>

    '<*'<A, B>(fa: NonEmptyBox<A>, fb: NonEmptyBox<B>): NonEmptyBox<A>

    '<**>'<A, B>(fa: NonEmptyBox<A>, f: NonEmptyBox<FunctionArrow<A, B>>): NonEmptyBox<B>

    fmap<A, B>(f: (a: A) => B, fa: NonEmptyBox<A>): NonEmptyBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: NonEmptyBox<A>): NonEmptyBox<B>

    '<$'<A, B>(a: A, fb: NonEmptyBox<B>): NonEmptyBox<A>

    '$>'<A, B>(fa: NonEmptyBox<A>, b: B): NonEmptyBox<B>

    '<&>'<A, B>(fa: NonEmptyBox<A>, f: (a: A) => B): NonEmptyBox<B>

    void<A>(fa: NonEmptyBox<A>): NonEmptyBox<[]>
}

const baseImplementation = {
    '>>=': <A, B>(ma: NonEmptyBox<A>, f: FunctionArrow<A, NonEmptyBox<B>>): NonEmptyBox<B> => {
        const a = head(ma)
        const as = tail(ma)
        const b = toList(f(a))
        const bs = listMonad['>>='](as, compose(toList, f))

        return formList(concat(b, bs))
    },
}

export const monad = createMonad(baseImplementation, applicative) as NonEmptyMonad
