import { FMap, Functor, functor as createFunctor } from 'ghc/base/functor'
import { map, NonEmptyBox } from './list'

export interface NonEmptyFunctor extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: NonEmptyBox<A>): NonEmptyBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: NonEmptyBox<A>): NonEmptyBox<B>

    '<$'<A, B>(a: A, fb: NonEmptyBox<B>): NonEmptyBox<A>

    '$>'<A, B>(fa: NonEmptyBox<A>, b: B): NonEmptyBox<B>

    '<&>'<A, B>(fa: NonEmptyBox<A>, f: (a: A) => B): NonEmptyBox<B>

    void<A>(fa: NonEmptyBox<A>): NonEmptyBox<[]>
}

const fmap: FMap = {
    // fmap :: NonEmptyBox f => (a -> b) ->  f a -> f b
    fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: NonEmptyBox<A>) => map(f, fa),
}

export const functor = createFunctor(fmap) as NonEmptyFunctor
