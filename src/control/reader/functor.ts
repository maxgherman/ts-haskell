import { Functor, FunctorBase, functor as createFunctor } from 'ghc/base/functor'
import { reader, ReaderBox } from './reader'

export interface ReaderFunctor<R> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: ReaderBox<R, A>): ReaderBox<R, B>

    '<$>'<A, B>(f: (a: A) => B, fa: ReaderBox<R, A>): ReaderBox<R, B>

    '<$'<A, B>(a: A, fb: ReaderBox<R, B>): ReaderBox<R, A>

    '$>'<A, B>(fa: ReaderBox<R, A>, b: B): ReaderBox<R, B>

    '<&>'<A, B>(fa: ReaderBox<R, A>, f: (a: A) => B): ReaderBox<R, B>

    void<A>(fa: ReaderBox<R, A>): ReaderBox<R, []>
}

const fmap = <R>(): FunctorBase => ({
    // fmap :: Reader r => (a -> b) -> Reader r a -> Reader r b
    fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: ReaderBox<R, A>): ReaderBox<R, B> =>
        reader((r: R) => f(fa.runReader(r))),
})

export const functor = <R>() => createFunctor(fmap<R>()) as ReaderFunctor<R>
