import { Box1, MinBox0, MinBox1, Type } from 'data/kind'
import type { Monad } from 'ghc/base/monad/monad'
import type { Monoid } from 'ghc/base/monoid'
import { tuple2, Tuple2Box } from 'ghc/base/tuple/tuple'

export type RWSTResult<W, S, A> = Tuple2Box<Tuple2Box<A, S>, W>

export interface RWST<R, W, S, A> {
    readonly runRWST: (r: R, s: S) => MinBox1<RWSTResult<W, S, A>>
}

export type RWSTBox<R, W, S, A> = RWST<R, W, S, A> & Box1<A>

export const rwst = <R, W, S, A>(fn: (r: R, s: S) => MinBox1<RWSTResult<W, S, A>>): RWSTBox<R, W, S, A> => ({
    runRWST: fn,
    kind: (_: '*') => '*' as Type,
})

export const runRWST = <R, W, S, A>(ma: RWST<R, W, S, A>, r: R, s: S): MinBox1<RWSTResult<W, S, A>> => {
    return ma.runRWST(r, s)
}

export const lift = <R, W, S>(m: Monad, wMonoid: Monoid<W>) => {
    return <A>(ma: MinBox1<A>): RWSTBox<R, W, S, A> =>
        rwst((_: R, s: S): MinBox1<RWSTResult<W, S, A>> => {
            return m['<$>']((a: A) => tuple2(tuple2(a as NonNullable<A>, s), wMonoid.mempty as unknown as W), ma)
        })
}
