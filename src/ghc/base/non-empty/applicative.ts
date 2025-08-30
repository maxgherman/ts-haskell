// instance Applicative NonEmpty -- Defined in ‘GHC.Base’

import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { functor } from './functor'
import { NonEmptyBox, cons, toList, fromList } from './list'
import { nil, ListBox } from 'ghc/base/list/list'
import { monad } from 'ghc/base/list/monad'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { ap, liftM2 } from 'ghc/base/monad/monad'

export interface NonEmptyApplicative extends Applicative {
    pure<A>(a: NonNullable<A>): NonEmptyBox<A>

    '<*>'<A, B>(f: NonEmptyBox<FunctionArrow<A, B>>, fa: NonEmptyBox<A>): NonEmptyBox<B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, NonNullable<C>>, fa: NonEmptyBox<A>, fb: NonEmptyBox<B>): NonEmptyBox<C>

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

const baseImplementation: BaseImplementation = {
    pure: <A>(a: NonNullable<A>): NonEmptyBox<A> => cons(a)(nil()),

    '<*>': <A, B>(f: NonEmptyBox<FunctionArrow<A, B>>, fa: NonEmptyBox<A>): NonEmptyBox<B> => {
        const fList = toList(f)
        const faList = toList(fa)

        const result = ap(monad, fList, faList) as ListBox<B>
        return fromList(result)
    },

    liftA2: <A, B, C>(
        f: FunctionArrow2<A, B, NonNullable<C>>,
        fa: NonEmptyBox<A>,
        fb: NonEmptyBox<B>,
    ): NonEmptyBox<C> => {
        const faList = toList(fa)
        const fbList = toList(fb)

        const result = liftM2(monad, f, faList, fbList) as ListBox<C>
        return fromList(result)
    },
}

export const applicative = createApplicative(baseImplementation, functor) as NonEmptyApplicative
