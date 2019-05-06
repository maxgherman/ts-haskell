import { identity } from 'ramda'
import { functor as baseFunctor, IFunctor } from '@control/common/functor'
import { IsPromise, PromiseBox } from '@common/types/promise-box'

export interface IPromiseFunctor extends IFunctor<IsPromise> {
    fmap: <A, B>(f: (a: A) => B, fa: PromiseBox<A>) => PromiseBox<B>
    '<$>': <A, B>(f: (a: A) => B, fa: PromiseBox<A>) => PromiseBox<B>
    '<$': <A, B>(a: A, fb: PromiseBox<B>) => PromiseBox<A>
    '$>': <A, B>(fa: PromiseBox<A>, b: B) => PromiseBox<B>
    '<&>': <A, B>(fa: PromiseBox<A>, f: (a: A) => B) => PromiseBox<B>
}

const fmap = <A, B>(f: (a: A) => B, fa: PromiseBox<A>): PromiseBox<B> => {
    f = f || (identity as (a: A) => B)
    fa = fa || Promise.resolve()

    const result = (fa as Promise<A>).then(f)
    return result
}

export const functor = baseFunctor<IsPromise>({ fmap }) as IPromiseFunctor