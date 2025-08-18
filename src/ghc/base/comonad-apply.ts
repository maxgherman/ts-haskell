import { MinBox1 } from 'data/kind'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { id } from 'ghc/base/functions'
import { Comonad } from './comonad'

export type ComonadApplyBase = Comonad & {
    '<@>'<A, B>(f: MinBox1<FunctionArrow<A, B>>, wa: MinBox1<A>): MinBox1<B>
    liftW2<A, B, C>(f: FunctionArrow2<A, B, C>, wa: MinBox1<A>, wb: MinBox1<B>): MinBox1<C>
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

    return result
}
