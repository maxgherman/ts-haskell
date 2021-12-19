import { PromiseBox } from './promise'
import { FMap, Functor, functor as createFunctor } from 'ghc/base/functor'

export interface MaybeFunctor extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: PromiseBox<A>): PromiseBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: PromiseBox<A>): PromiseBox<B>

    '<$'<A, B>(a: A, fb: PromiseBox<B>): PromiseBox<A>

    '$>'<A, B>(fa: PromiseBox<A>, b: B): PromiseBox<B>

    '<&>'<A, B>(fa: PromiseBox<A>, f: (a: A) => B): PromiseBox<B>

    void<A>(fa: PromiseBox<A>): PromiseBox<[]>
}

const fmap: FMap = {
    // fmap :: PromiseBox f => (a -> b) ->  f a -> f b
    fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: PromiseBox<A>): PromiseBox<B> => fa.then(f) as PromiseBox<B>,
}

export const functor = createFunctor(fmap) as MaybeFunctor
