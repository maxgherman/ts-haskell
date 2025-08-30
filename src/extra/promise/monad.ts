import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative } from './applicative'
import { PromiseBox } from './promise'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface PromiseMonad extends Monad {
    '>>='<A, B>(ma: PromiseBox<A>, f: FunctionArrow<A, PromiseBox<B>>): PromiseBox<B>

    '>>'<A, B>(ma: PromiseBox<A>, mb: PromiseBox<B>): PromiseBox<B>

    return<A>(a: NonNullable<A>): PromiseBox<A>

    pure<A>(a: A): PromiseBox<A>

    '<*>'<A, B>(f: PromiseBox<FunctionArrow<A, B>>, fa: PromiseBox<A>): PromiseBox<B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: PromiseBox<A>, fb: PromiseBox<B>): PromiseBox<C>

    '*>'<A, B>(fa: PromiseBox<A>, fb: PromiseBox<B>): PromiseBox<B>

    '<*'<A, B>(fa: PromiseBox<A>, fb: PromiseBox<B>): PromiseBox<A>

    '<**>'<A, B>(fa: PromiseBox<A>, f: PromiseBox<FunctionArrow<A, B>>): PromiseBox<B>

    fmap<A, B>(f: (a: A) => B, fa: PromiseBox<A>): PromiseBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: PromiseBox<A>): PromiseBox<B>

    '<$'<A, B>(a: A, fb: PromiseBox<B>): PromiseBox<A>

    '$>'<A, B>(fa: PromiseBox<A>, b: B): PromiseBox<B>

    '<&>'<A, B>(fa: PromiseBox<A>, f: (a: A) => B): PromiseBox<B>

    void<A>(fa: PromiseBox<A>): PromiseBox<[]>
}

const baseImplementation = {
    '>>=': <A, B>(ma: PromiseBox<A>, f: FunctionArrow<A, PromiseBox<B>>): PromiseBox<B> =>
        ma.then((data) => f(data)) as PromiseBox<B>,
}

export const monad = createMonad(baseImplementation, applicative) as PromiseMonad
