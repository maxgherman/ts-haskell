import { compose } from 'ghc/base/functions'
import { FunctorBase, Functor, functor as createFunctor } from 'ghc/base/functor'
import { curry, fst, snd, tuple2, Tuple2Box } from './tuple'

export interface Tuple2Functor<T> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: Tuple2Box<T, A>): Tuple2Box<T, B>

    '<$>'<A, B>(f: (a: A) => B, fa: Tuple2Box<T, A>): Tuple2Box<T, B>

    '<$'<A, B>(a: A, fb: Tuple2Box<T, B>): Tuple2Box<T, A>

    '$>'<A, B>(fa: Tuple2Box<T, A>, b: B): Tuple2Box<T, B>

    '<&>'<A, B>(fa: Tuple2Box<T, A>, f: (a: A) => B): Tuple2Box<T, B>

    void<A>(fa: Tuple2Box<T, A>): Tuple2Box<T, []>
}

const fmap = <T>(): FunctorBase => ({
    // fmap :: Tuple2Box f => (a -> b) ->  f a -> f b
    fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: Tuple2Box<T, A>): Tuple2Box<T, B> =>
        compose<Tuple2Box<T, A>, A, B, Tuple2Box<T, B>>(curry(tuple2)(fst(fa)), f, snd)(fst(fa), snd(fa)),
})

export const functor = <T>() => createFunctor(fmap<T>()) as Tuple2Functor<T>
