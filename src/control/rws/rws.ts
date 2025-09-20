import { Box3, MinBox1, Type } from 'data/kind'
import { tuple2, Tuple2Box, fst, snd } from 'ghc/base/tuple/tuple'

export type RWSResult<R, W, S, A> = Tuple2Box<Tuple2Box<A, S>, W>

export interface RWS<R, W, S, A> {
    readonly runRWS: (r: R, s: S) => RWSResult<R, W, S, A>
}

export type RWSBox<R, W, S, A> = RWS<R, W, S, A> & Box3<R, W, S>

export type RWSMinBox<R, W, S, A> = RWS<R, W, S, MinBox1<A>> & Box3<R, W, S>

export const rws = <R, W, S, A>(fn: (r: R, s: S) => RWSResult<R, W, S, A>): RWSBox<R, W, S, A> => ({
    runRWS: fn,
    kind: (_: '*') => (_: '*') => (_: '*') => '*' as Type,
})

export const runRWS = <R, W, S, A>(ma: RWS<R, W, S, A>, r: R, s: S): RWSResult<R, W, S, A> => ma.runRWS(r, s)

export const evalRWS = <R, W, S, A>(ma: RWS<R, W, S, A>, r: R, s: S): A => fst(fst(runRWS(ma, r, s)))

export const execRWS = <R, W, S, A>(ma: RWS<R, W, S, A>, r: R, s: S): Tuple2Box<S, W> => {
    const result = runRWS(ma, r, s)
    return tuple2(snd(fst(result)), snd(result))
}
