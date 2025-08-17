import { comonad as createComonad, Comonad, BaseImplementation } from 'ghc/base/comonad'
import { reader, ReaderBox } from './reader'
import { functor as createFunctor } from './functor'

export interface ReaderComonad<R> extends Comonad {
    extract<A>(wa: ReaderBox<R, A>): A
    extend<A, B>(f: (wa: ReaderBox<R, A>) => B, wa: ReaderBox<R, A>): ReaderBox<R, B>
    duplicate<A>(wa: ReaderBox<R, A>): ReaderBox<R, ReaderBox<R, A>>

    fmap<A, B>(f: (a: A) => B, fa: ReaderBox<R, A>): ReaderBox<R, B>
    '<$>'<A, B>(f: (a: A) => B, fa: ReaderBox<R, A>): ReaderBox<R, B>
    '<$'<A, B>(a: A, fb: ReaderBox<R, B>): ReaderBox<R, A>
    '$>'<A, B>(fa: ReaderBox<R, A>, b: B): ReaderBox<R, B>
    '<&>'<A, B>(fa: ReaderBox<R, A>, f: (a: A) => B): ReaderBox<R, B>
    void<A>(fa: ReaderBox<R, A>): ReaderBox<R, []>
}

const baseImplementation = <R>(): BaseImplementation => ({
    extract: <A>(wa: ReaderBox<R, A>): A => wa.runReader(undefined as unknown as R),
    extend: <A, B>(f: (wa: ReaderBox<R, A>) => B, wa: ReaderBox<R, A>): ReaderBox<R, B> =>
        reader((_: R) => f(wa)),
    duplicate: <A>(wa: ReaderBox<R, A>): ReaderBox<R, ReaderBox<R, A>> =>
        reader((_: R) => wa),
})

export const comonad = <R>(): ReaderComonad<R> => {
    const functor = createFunctor<R>()
    const base = baseImplementation<R>()
    return createComonad(base, functor) as ReaderComonad<R>
}
