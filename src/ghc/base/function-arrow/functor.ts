import { FMap, Functor, functor as createFunctor } from 'ghc/base/functor'
import { FunctionArrowBox, withKind } from 'ghc/prim/function-arrow'

export interface FunctionArrowFunctor<T> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B>

    '<$>'<A, B>(f: (a: A) => B, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B>

    '<$'<A, B>(a: A, fb: FunctionArrowBox<T, B>): FunctionArrowBox<T, A>

    '$>'<A, B>(fa: FunctionArrowBox<T, A>, b: B): FunctionArrowBox<T, B>

    '<&>'<A, B>(fa: FunctionArrowBox<T, A>, f: (a: A) => B): FunctionArrowBox<T, B>

    void<A>(fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, []>
}

const fmap = <T>(): FMap => ({
    // fmap :: MaybeBox f => (a -> b) ->  f a -> f b
    fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: FunctionArrowBox<T, A>): FunctionArrowBox<T, B> =>
        withKind((x: T) => f(fa(x))),
})

export const functor = <T>() => createFunctor(fmap<T>()) as FunctionArrowFunctor<T>
