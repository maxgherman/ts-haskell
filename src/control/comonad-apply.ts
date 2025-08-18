import { MinBox1 } from 'data/kind'
import { FunctionArrow, FunctionArrow2, FunctionArrow3 } from 'ghc/prim/function-arrow'
import { id } from 'ghc/base/functions'
import { Comonad } from './comonad'

export type ComonadApplyBase = Comonad & {
    '<@>'<A, B>(f: MinBox1<FunctionArrow<A, B>>, wa: MinBox1<A>): MinBox1<B>
    '<@@>'<A, B>(wa: MinBox1<A>, wf: MinBox1<FunctionArrow<A, B>>): MinBox1<B>
    liftW2<A, B, C>(f: FunctionArrow2<A, B, C>, wa: MinBox1<A>, wb: MinBox1<B>): MinBox1<C>
    liftW3<A, B, C, D>(f: FunctionArrow3<A, B, C, D>, wa: MinBox1<A>, wb: MinBox1<B>, wc: MinBox1<C>): MinBox1<D>
    kfix<A>(w: MinBox1<(wa: MinBox1<A>) => A>): MinBox1<A>
}

export type ComonadApply = ComonadApplyBase

export type BaseImplementation = Partial<Pick<ComonadApplyBase, '<@>' | 'liftW2'>> &
    (Pick<ComonadApplyBase, '<@>'> | Pick<ComonadApplyBase, 'liftW2'>)

export const comonadApply = (base: BaseImplementation, comonad: Comonad): ComonadApply => {
    const result: ComonadApply = { ...comonad, ...base } as ComonadApply

    if (!result.liftW2 && result['<@>']) {
        result.liftW2 = <A, B, C>(f: FunctionArrow2<A, B, C>, wa: MinBox1<A>, wb: MinBox1<B>): MinBox1<C> =>
            result['<@>']!(comonad['<$>'](f, wa), wb)
    }

    if (!result['<@>'] && result.liftW2) {
        result['<@>'] = <A, B>(wf: MinBox1<FunctionArrow<A, B>>, wa: MinBox1<A>): MinBox1<B> =>
            result.liftW2!(id, wf, wa)
    }

    if (!result['<@@>']) {
        result['<@@>'] = <A, B>(wa: MinBox1<A>, wf: MinBox1<FunctionArrow<A, B>>): MinBox1<B> =>
            result.liftW2!((a: A) => (f: FunctionArrow<A, B>) => f(a), wa, wf)
    }

    if (!result.liftW3) {
        result.liftW3 = <A, B, C, D>(
            f: FunctionArrow3<A, B, C, D>,
            wa: MinBox1<A>,
            wb: MinBox1<B>,
            wc: MinBox1<C>,
        ): MinBox1<D> => result['<@>']!(result['<@>']!(comonad['<$>'](f, wa), wb), wc)
    }

    result.kfix = <A>(w: MinBox1<(wa: MinBox1<A>) => A>): MinBox1<A> => {
        let u!: MinBox1<A>
        // eslint-disable-next-line prefer-const
        u = result['<@>']!(w, result.duplicate(u as MinBox1<A>))
        return u
    }

    return result
}
