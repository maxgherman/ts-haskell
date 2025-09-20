import { MinBox0, MinBox1 } from 'data/kind'
import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import type { Monoid } from 'ghc/base/monoid'
import { RWS, RWSBox, RWSResult, rws } from './rws'
import { applicative as createApplicative } from './applicative'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

export interface RWSMonad<R, W, S> extends Monad {
    '>>='<A, B>(ma: RWSBox<R, W, S, A>, f: FunctionArrow<A, RWSBox<R, W, S, B>>): RWSBox<R, W, S, B>

    '>>'<A, B>(ma: RWSBox<R, W, S, A>, mb: RWSBox<R, W, S, B>): RWSBox<R, W, S, B>

    return<A>(a: NonNullable<A>): RWSBox<R, W, S, A>

    pure<A>(a: NonNullable<A>): RWSBox<R, W, S, A>

    '<*>'<A, B>(f: RWSBox<R, W, S, FunctionArrow<A, B>>, fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: RWSBox<R, W, S, A>, fb: RWSBox<R, W, S, B>): RWSBox<R, W, S, C>

    '*>'<A, B>(fa: RWSBox<R, W, S, A>, fb: RWSBox<R, W, S, B>): RWSBox<R, W, S, B>

    '<*'<A, B>(fa: RWSBox<R, W, S, A>, fb: RWSBox<R, W, S, B>): RWSBox<R, W, S, A>

    '<**>'<A, B>(fa: RWSBox<R, W, S, A>, f: RWSBox<R, W, S, FunctionArrow<A, B>>): RWSBox<R, W, S, B>

    fmap<A, B>(f: (a: A) => B, fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, B>

    '<$'<A, B>(a: A, fb: RWSBox<R, W, S, B>): RWSBox<R, W, S, A>

    '$>'<A, B>(fa: RWSBox<R, W, S, A>, b: B): RWSBox<R, W, S, B>

    '<&>'<A, B>(fa: RWSBox<R, W, S, A>, f: (a: A) => B): RWSBox<R, W, S, B>

    void<A>(fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, []>
}

const baseImplementation = <R, W, S>(wMonoid: Monoid<W>) => ({
    '>>=': <A, B>(ma: MinBox1<A>, f: FunctionArrow<A, MinBox1<B>>): MinBox1<B> =>
        rws((r: R, s0: S): RWSResult<R, W, S, B> => {
            const first = (ma as unknown as RWS<R, W, S, A>).runRWS(r, s0)
            const firstState = fst(first)
            const value = fst(firstState)
            const s1 = snd(firstState)
            const w1 = snd(first)

            const second = (f(value) as unknown as RWS<R, W, S, B>).runRWS(r, s1)
            const secondState = fst(second)
            const resultValue = fst(secondState)
            const s2 = snd(secondState)
            const w2 = snd(second)

            const combined = wMonoid['<>'](w1 as unknown as MinBox0<W>, w2 as unknown as MinBox0<W>)
            return tuple2(tuple2(resultValue, s2), combined as unknown as W)
        }) as unknown as MinBox1<B>,
})

export const monad = <R, W, S>(wMonoid: Monoid<W>): RWSMonad<R, W, S> => {
    const base = baseImplementation<R, W, S>(wMonoid)
    const app = createApplicative<R, W, S>(wMonoid)
    return createMonad(base, app) as RWSMonad<R, W, S>
}
