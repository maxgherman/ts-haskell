import { MinBox0, MinBox1 } from 'data/kind'
import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import type { Monoid } from 'ghc/base/monoid'
import { RWS, RWSBox, RWSResult, rws } from './rws'
import { functor as createFunctor } from './functor'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

export interface RWSApplicative<R, W, S> extends Applicative {
    pure<A>(a: NonNullable<A>): RWSBox<R, W, S, A>

    '<*>'<A, B>(f: RWSBox<R, W, S, FunctionArrow<A, B>>, fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: RWSBox<R, W, S, A>, fb: RWSBox<R, W, S, B>): RWSBox<R, W, S, C>

    fmap<A, B>(f: (a: A) => B, fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, B>

    '<$'<A, B>(a: A, fb: RWSBox<R, W, S, B>): RWSBox<R, W, S, A>

    '$>'<A, B>(fa: RWSBox<R, W, S, A>, b: B): RWSBox<R, W, S, B>

    '<&>'<A, B>(fa: RWSBox<R, W, S, A>, f: (a: A) => B): RWSBox<R, W, S, B>

    void<A>(fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, []>
}

const baseImpl = <R, W, S>(wMonoid: Monoid<W>): BaseImplementation => ({
    pure: <A>(a: NonNullable<A>): MinBox1<A> =>
        rws((_: R, s: S): RWSResult<R, W, S, A> => {
            return tuple2(tuple2(a, s), wMonoid.mempty as unknown as W)
        }) as unknown as MinBox1<A>,

    '<*>': <A, B>(f: MinBox1<FunctionArrow<A, B>>, fa: MinBox1<A>): MinBox1<B> =>
        rws((r: R, s0: S): RWSResult<R, W, S, B> => {
            const fr = (f as unknown as RWS<R, W, S, FunctionArrow<A, B>>).runRWS(r, s0)
            const fvState = fst(fr)
            const fn = fst(fvState)
            const s1 = snd(fvState)
            const w1 = snd(fr)

            const ar = (fa as unknown as RWS<R, W, S, A>).runRWS(r, s1)
            const avState = fst(ar)
            const aValue = fst(avState)
            const s2 = snd(avState)
            const w2 = snd(ar)

            const combined = wMonoid['<>'](w1 as unknown as MinBox0<W>, w2 as unknown as MinBox0<W>)
            return tuple2(tuple2(fn(aValue), s2), combined as unknown as W)
        }) as unknown as MinBox1<B>,

    liftA2: <A, B, C>(f: FunctionArrow2<A, B, C>, fa: MinBox1<A>, fb: MinBox1<B>): MinBox1<C> =>
        rws((r: R, s0: S): RWSResult<R, W, S, C> => {
            const ar = (fa as unknown as RWS<R, W, S, A>).runRWS(r, s0)
            const aState = fst(ar)
            const aValue = fst(aState)
            const s1 = snd(aState)
            const w1 = snd(ar)

            const br = (fb as unknown as RWS<R, W, S, B>).runRWS(r, s1)
            const bState = fst(br)
            const bValue = fst(bState)
            const s2 = snd(bState)
            const w2 = snd(br)

            const combined = wMonoid['<>'](w1 as unknown as MinBox0<W>, w2 as unknown as MinBox0<W>)
            return tuple2(tuple2(f(aValue)(bValue), s2), combined as unknown as W)
        }) as unknown as MinBox1<C>,
})

export const applicative = <R, W, S>(wMonoid: Monoid<W>): RWSApplicative<R, W, S> => {
    const functor = createFunctor<R, W, S>()
    return createApplicative(baseImpl<R, W, S>(wMonoid), functor) as RWSApplicative<R, W, S>
}
