import { MinBox0, MinBox1 } from 'data/kind'
import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import type { Monoid } from 'ghc/base/monoid'
import { RWST, RWSTBox, RWSTResult, rwst } from './rwst-t'
import { applicative as createApplicative, RWSTApplicative } from './applicative'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

export interface RWSTMonad<R, W, S> extends Monad {
    '>>='<A, B>(ma: RWSTBox<R, W, S, A>, f: FunctionArrow<A, RWSTBox<R, W, S, B>>): RWSTBox<R, W, S, B>

    '>>'<A, B>(ma: RWSTBox<R, W, S, A>, mb: RWSTBox<R, W, S, B>): RWSTBox<R, W, S, B>

    return<A>(a: NonNullable<A>): RWSTBox<R, W, S, A>

    pure<A>(a: NonNullable<A>): RWSTBox<R, W, S, A>

    '<*>'<A, B>(f: RWSTBox<R, W, S, FunctionArrow<A, B>>, fa: RWSTBox<R, W, S, A>): RWSTBox<R, W, S, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: RWSTBox<R, W, S, A>, fb: RWSTBox<R, W, S, B>): RWSTBox<R, W, S, C>

    '*>'<A, B>(fa: RWSTBox<R, W, S, A>, fb: RWSTBox<R, W, S, B>): RWSTBox<R, W, S, B>

    '<*'<A, B>(fa: RWSTBox<R, W, S, A>, fb: RWSTBox<R, W, S, B>): RWSTBox<R, W, S, A>

    '<**>'<A, B>(fa: RWSTBox<R, W, S, A>, f: RWSTBox<R, W, S, FunctionArrow<A, B>>): RWSTBox<R, W, S, B>

    fmap<A, B>(f: (a: A) => B, fa: RWSTBox<R, W, S, A>): RWSTBox<R, W, S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: RWSTBox<R, W, S, A>): RWSTBox<R, W, S, B>

    '<$'<A, B>(a: A, fb: RWSTBox<R, W, S, B>): RWSTBox<R, W, S, A>

    '$>'<A, B>(fa: RWSTBox<R, W, S, A>, b: B): RWSTBox<R, W, S, B>

    '<&>'<A, B>(fa: RWSTBox<R, W, S, A>, f: (a: A) => B): RWSTBox<R, W, S, B>

    void<A>(fa: RWSTBox<R, W, S, A>): RWSTBox<R, W, S, []>
}

const combine = <W>(monoid: Monoid<W>) => {
    return (w1: W, w2: W): W => {
        return monoid['<>'](w1 as unknown as MinBox0<W>, w2 as unknown as MinBox0<W>) as unknown as W
    }
}

const baseImplementation = <R, W, S>(m: Monad, wMonoid: Monoid<W>) => ({
    '>>=': <A, B>(ma: MinBox1<A>, f: FunctionArrow<A, MinBox1<B>>): MinBox1<B> =>
        rwst((r: R, s0: S): MinBox1<RWSTResult<W, S, B>> => {
            const runA = (ma as unknown as RWST<R, W, S, A>).runRWST(r, s0)
            return m['>>='](runA, (first) => {
                const state1 = fst(first)
                const value = fst(state1)
                const s1 = snd(state1)
                const w1 = snd(first)

                const runB = (f(value) as unknown as RWST<R, W, S, B>).runRWST(r, s1)
                return m['>>='](runB, (second) => {
                    const state2 = fst(second)
                    const resultValue = fst(state2)
                    const s2 = snd(state2)
                    const w2 = snd(second)
                    const logs = combine(wMonoid)(w1, w2)
                    return m.return(tuple2(tuple2(resultValue, s2), logs))
                })
            })
        }) as unknown as MinBox1<B>,
})

export const monad = <R, W, S>(m: Monad, wMonoid: Monoid<W>): RWSTMonad<R, W, S> => {
    const base = baseImplementation<R, W, S>(m, wMonoid)
    const app = createApplicative<R, W, S>(m, wMonoid)
    return createMonad(base, app as unknown as RWSTApplicative<R, W, S>) as RWSTMonad<R, W, S>
}
