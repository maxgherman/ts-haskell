import { comonadApply as createComonadApply, ComonadApply, BaseImplementation } from 'control/comonad-apply'
import { ReaderBox, reader } from './reader'
import { comonad as createComonad } from './comonad'
import type { FunctionArrow, FunctionArrow2, FunctionArrow3 } from 'ghc/prim/function-arrow'

export interface ReaderComonadApply<R> extends ComonadApply {
    '<@>'<A, B>(f: ReaderBox<R, FunctionArrow<A, B>>, wa: ReaderBox<R, A>): ReaderBox<R, B>
    '<@@>'<A, B>(wa: ReaderBox<R, A>, wf: ReaderBox<R, FunctionArrow<A, B>>): ReaderBox<R, B>
    liftW2<A, B, C>(f: FunctionArrow2<A, B, C>, wa: ReaderBox<R, A>, wb: ReaderBox<R, B>): ReaderBox<R, C>
    liftW3<A, B, C, D>(
        f: FunctionArrow3<A, B, C, D>,
        wa: ReaderBox<R, A>,
        wb: ReaderBox<R, B>,
        wc: ReaderBox<R, C>,
    ): ReaderBox<R, D>

    kfix<A>(w: ReaderBox<R, (wa: ReaderBox<R, A>) => A>): ReaderBox<R, A>

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
    '<@>': <A, B>(wf: ReaderBox<R, FunctionArrow<A, B>>, wa: ReaderBox<R, A>): ReaderBox<R, B> =>
        reader((r: R) => wf.runReader(r)(wa.runReader(r))),
    liftW2: <A, B, C>(f: FunctionArrow2<A, B, C>, wa: ReaderBox<R, A>, wb: ReaderBox<R, B>): ReaderBox<R, C> =>
        reader((r: R) => f(wa.runReader(r))(wb.runReader(r))),
})

export const comonadApply = <R>(): ReaderComonadApply<R> => {
    const cm = createComonad<R>()
    const base = baseImplementation<R>()
    return createComonadApply(base, cm) as ReaderComonadApply<R>
}
