import { MinBox1 } from 'data/kind'
import { Functor, functor as createFunctor, FunctorBase } from 'ghc/base/functor'
import { RWS, RWSBox, RWSResult, rws } from './rws'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'

export interface RWSFunctor<R, W, S> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, B>

    '<$'<A, B>(a: A, fb: RWSBox<R, W, S, B>): RWSBox<R, W, S, A>

    '$>'<A, B>(fa: RWSBox<R, W, S, A>, b: B): RWSBox<R, W, S, B>

    '<&>'<A, B>(fa: RWSBox<R, W, S, A>, f: (a: A) => B): RWSBox<R, W, S, B>

    void<A>(fa: RWSBox<R, W, S, A>): RWSBox<R, W, S, []>
}

const base = <R, W, S>(): FunctorBase => ({
    fmap: <A, B>(f: (a: A) => B, fa: MinBox1<A>): MinBox1<B> => {
        const source = fa as unknown as RWS<R, W, S, A>
        return rws((r: R, s: S): RWSResult<R, W, S, B> => {
            const result = source.runRWS(r, s)
            const valueState = fst(result)
            const value = fst(valueState)
            const nextState = snd(valueState)
            const logs = snd(result)
            return tuple2(tuple2(f(value), nextState), logs)
        }) as unknown as MinBox1<B>
    },
})

export const functor = <R, W, S>(): RWSFunctor<R, W, S> => createFunctor(base<R, W, S>()) as RWSFunctor<R, W, S>
