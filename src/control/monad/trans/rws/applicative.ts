import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import type { Monad } from 'ghc/base/monad/monad'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import type { Monoid } from 'ghc/base/monoid'
import { MinBox0, MinBox1 } from 'data/kind'
import { RWST, RWSTBox, RWSTResult, rwst } from './rwst-t'
import { functor as createFunctor } from './functor'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

export interface RWSTApplicative<R, W, S> extends Applicative {
    pure<A>(a: NonNullable<A>): RWSTBox<R, W, S, A>

    '<*>'<A, B>(f: RWSTBox<R, W, S, FunctionArrow<A, B>>, fa: RWSTBox<R, W, S, A>): RWSTBox<R, W, S, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: RWSTBox<R, W, S, A>, fb: RWSTBox<R, W, S, B>): RWSTBox<R, W, S, C>

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

const baseImpl = <R, W, S>(m: Monad, wMonoid: Monoid<W>): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): MinBox1<A> =>
        rwst((_: R, s: S): MinBox1<RWSTResult<W, S, A>> => {
            return m.pure(tuple2(tuple2(a, s), wMonoid.mempty as unknown as W))
        }) as unknown as MinBox1<A>,

    '<*>': <A, B>(f: MinBox1<FunctionArrow<A, B>>, fa: MinBox1<A>): MinBox1<B> =>
        rwst((r: R, s0: S): MinBox1<RWSTResult<W, S, B>> => {
            const runFn = (f as unknown as RWST<R, W, S, FunctionArrow<A, B>>).runRWST(r, s0)
            return m['>>='](runFn, (fr) => {
                const fnState = fst(fr)
                const fn = fst(fnState)
                const s1 = snd(fnState)
                const w1 = snd(fr)

                const runArg = (fa as unknown as RWST<R, W, S, A>).runRWST(r, s1)
                return m['>>='](runArg, (ar) => {
                    const argState = fst(ar)
                    const value = fst(argState)
                    const s2 = snd(argState)
                    const w2 = snd(ar)
                    const logs = combine(wMonoid)(w1, w2)
                    return m.return(tuple2(tuple2(fn(value), s2), logs))
                })
            })
        }) as unknown as MinBox1<B>,

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<C> =>
        rwst((r: R, s0: S): MinBox1<RWSTResult<W, S, C>> => {
            const runA = (fa as unknown as RWST<R, W, S, A>).runRWST(r, s0)
            return m['>>='](runA, (ar) => {
                const aState = fst(ar)
                const aValue = fst(aState)
                const s1 = snd(aState)
                const w1 = snd(ar)

                const runB = (fb as unknown as RWST<R, W, S, B>).runRWST(r, s1)
                return m['>>='](runB, (br) => {
                    const bState = fst(br)
                    const bValue = fst(bState)
                    const s2 = snd(bState)
                    const w2 = snd(br)
                    const logs = combine(wMonoid)(w1, w2)
                    return m.return(tuple2(tuple2(f(aValue)(bValue), s2), logs))
                })
            })
        }) as unknown as MinBox1<C>,
})

export const applicative = <R, W, S>(m: Monad, wMonoid: Monoid<W>): RWSTApplicative<R, W, S> => {
    const functor = createFunctor<R, W, S>(m)
    return createApplicative(baseImpl<R, W, S>(m, wMonoid), functor) as RWSTApplicative<R, W, S>
}
