import { comonadApply as createComonadApply, ComonadApply, BaseImplementation } from 'control/comonad-apply'
import { Tuple2BoxT, tuple2 } from './tuple'
import { comonad as createComonad } from './tuple2-comonad'
import { FunctionArrow, FunctionArrow2, FunctionArrow3 } from 'ghc/prim/function-arrow'

export interface Tuple2ComonadApply<T> extends ComonadApply {
    '<@>'<A, B>(f: Tuple2BoxT<T, FunctionArrow<A, B>>, wa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>
    '<@@>'<A, B>(wa: Tuple2BoxT<T, A>, wf: Tuple2BoxT<T, FunctionArrow<A, B>>): Tuple2BoxT<T, B>
    liftW2<A, B, C>(f: FunctionArrow2<A, B, C>, wa: Tuple2BoxT<T, A>, wb: Tuple2BoxT<T, B>): Tuple2BoxT<T, C>
    liftW3<A, B, C, D>(
        f: FunctionArrow3<A, B, C, D>,
        wa: Tuple2BoxT<T, A>,
        wb: Tuple2BoxT<T, B>,
        wc: Tuple2BoxT<T, C>,
    ): Tuple2BoxT<T, D>

    extract<A>(wa: Tuple2BoxT<T, A>): A
    extend<A, B>(f: (wa: Tuple2BoxT<T, A>) => B, wa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>
    duplicate<A>(wa: Tuple2BoxT<T, A>): Tuple2BoxT<T, Tuple2BoxT<T, A>>

    fmap<A, B>(f: (a: A) => B, fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>
    '<$>'<A, B>(f: (a: A) => B, fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>
    '<$'<A, B>(a: A, fb: Tuple2BoxT<T, B>): Tuple2BoxT<T, A>
    '$>'<A, B>(fa: Tuple2BoxT<T, A>, b: B): Tuple2BoxT<T, B>
    '<&>'<A, B>(fa: Tuple2BoxT<T, A>, f: (a: A) => B): Tuple2BoxT<T, B>
    void<A>(fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, []>
}

const baseImplementation = <T>(): BaseImplementation => ({
    '<@>': <A, B>(wf: Tuple2BoxT<T, FunctionArrow<A, B>>, wa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B> => {
        const [t, f] = wf
        const [, a] = wa
        return tuple2(t, f(a))
    },
    liftW2: <A, B, C>(f: FunctionArrow2<A, B, C>, wa: Tuple2BoxT<T, A>, wb: Tuple2BoxT<T, B>): Tuple2BoxT<T, C> => {
        const [t, a] = wa
        const [, b] = wb
        return tuple2(t, f(a)(b))
    },
})

export const comonadApply = <T>(): Tuple2ComonadApply<T> => {
    const cm = createComonad<T>()
    const base = baseImplementation<T>()
    return createComonadApply(base, cm) as Tuple2ComonadApply<T>
}
