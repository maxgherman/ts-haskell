import { FMap, Functor, functor as createFunctor } from 'ghc/base/functor'
import { ListBox, map } from './list'

export interface ListFunctor extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: ListBox<A>): ListBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: ListBox<A>): ListBox<B>

    '<$'<A, B>(a: A, fb: ListBox<B>): ListBox<A>

    '$>'<A, B>(fa: ListBox<A>, b: B): ListBox<B>

    '<&>'<A, B>(fa: ListBox<A>, f: (a: A) => B): ListBox<B>

    void<A>(fa: ListBox<A>): ListBox<[]>
}

const fmap: FMap = {
    // fmap :: ListBox f => (a -> b) ->  f a -> f b
    fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: ListBox<A>) => map(f, fa),
}

export const functor = createFunctor(fmap) as ListFunctor
