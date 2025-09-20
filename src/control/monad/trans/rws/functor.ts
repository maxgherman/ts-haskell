import { MinBox1 } from 'data/kind'
import { Functor, functor as createFunctor, FunctorBase } from 'ghc/base/functor'
import type { Monad } from 'ghc/base/monad/monad'
import { RWST, RWSTBox, RWSTResult, rwst } from './rwst-t'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

export interface RWSTFunctor<R, W, S> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: RWSTBox<R, W, S, A>): RWSTBox<R, W, S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: RWSTBox<R, W, S, A>): RWSTBox<R, W, S, B>

    '<$'<A, B>(a: A, fb: RWSTBox<R, W, S, B>): RWSTBox<R, W, S, A>

    '$>'<A, B>(fa: RWSTBox<R, W, S, A>, b: B): RWSTBox<R, W, S, B>

    '<&>'<A, B>(fa: RWSTBox<R, W, S, A>, f: (a: A) => B): RWSTBox<R, W, S, B>

    void<A>(fa: RWSTBox<R, W, S, A>): RWSTBox<R, W, S, []>
}

const base = <R, W, S>(m: Monad): FunctorBase => ({
    fmap: <A, B>(f: (a: A) => B, fa: MinBox1<A>): MinBox1<B> => {
        const source = fa as unknown as RWST<R, W, S, A>
        return rwst((r: R, s: S): MinBox1<RWSTResult<W, S, B>> => {
            return m['<$>'](
                (result: RWSTResult<W, S, A>) => {
                    const valueState = fst(result)
                    const value = fst(valueState)
                    const nextState = snd(valueState)
                    const logs = snd(result)
                    return tuple2(tuple2(f(value), nextState), logs)
                },
                source.runRWST(r, s),
            )
        }) as unknown as MinBox1<B>
    },
})

export const functor = <R, W, S>(m: Monad): RWSTFunctor<R, W, S> =>
    createFunctor(base<R, W, S>(m)) as RWSTFunctor<R, W, S>
