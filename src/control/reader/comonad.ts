import { comonad as createComonad, Comonad, BaseImplementation } from 'control/comonad'
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

    // Specialized Comonad methods with ReaderBox
    liftW<A, B>(f: (a: A) => B, wa: ReaderBox<R, A>): ReaderBox<R, B>
    wfix<A>(w: ReaderBox<R, (wa: ReaderBox<R, A>) => A>): A
    cfix<A>(f: (wa: ReaderBox<R, A>) => A): ReaderBox<R, A>
    '=>>'<A, B>(wa: ReaderBox<R, A>, f: (wa: ReaderBox<R, A>) => B): ReaderBox<R, B>
    '<<='<A, B>(f: (wa: ReaderBox<R, A>) => B, wa: ReaderBox<R, A>): ReaderBox<R, B>
    '=<='<A, B, C>(f: (wb: ReaderBox<R, B>) => C, g: (wa: ReaderBox<R, A>) => B, wa: ReaderBox<R, A>): C
    '=>='<A, B, C>(f: (wa: ReaderBox<R, A>) => B, g: (wb: ReaderBox<R, B>) => C, wa: ReaderBox<R, A>): C
}

const baseImplementation = <R>(): BaseImplementation => ({
    extract: <A>(wa: ReaderBox<R, A>): A => wa.runReader(undefined as unknown as R),
    extend: <A, B>(f: (wa: ReaderBox<R, A>) => B, wa: ReaderBox<R, A>): ReaderBox<R, B> => reader((_: R) => f(wa)),
    duplicate: <A>(wa: ReaderBox<R, A>): ReaderBox<R, ReaderBox<R, A>> => reader((_: R) => wa),
})

export const comonad = <R>(): ReaderComonad<R> => {
    const functor = createFunctor<R>()
    const base = baseImplementation<R>()
    return createComonad(base, functor) as ReaderComonad<R>
}
