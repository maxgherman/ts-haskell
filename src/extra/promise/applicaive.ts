import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { functor } from './functor'
import { PromiseBox } from './promise'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface PromiseApplicative extends Applicative {
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

const baseImplementation: BaseImplementation = {
    pure: <A>(a: A): PromiseBox<A> => Promise.resolve(a) as PromiseBox<A>,

    '<*>': <A, B>(f: PromiseBox<FunctionArrow<A, B>>, fa: PromiseBox<A>): PromiseBox<B> =>
        Promise.all([f, fa]).then(([f, fa]) => f(fa)) as PromiseBox<B>,
}

export const applicative = createApplicative(baseImplementation, functor) as PromiseApplicative
