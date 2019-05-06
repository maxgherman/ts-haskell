import { Application, Application2, Application3 } from '@common/types/application'
import { IsPromise, PromiseBox } from '@common/types/promise-box'
import { IMonad, IMonadBase, monad as monadBase } from '@control/common/monad'
import { applicative } from '@control/applicative/promise'

export interface IPromiseMonad extends IMonad<IsPromise> {
    fmap: <A, B>(f: (a: A) => B, fa: PromiseBox<A>) => PromiseBox<B>
    '<$>': <A, B>(f: (a: A) => B, fa: PromiseBox<A>) => PromiseBox<B>
    '<$': <A, B>(a: A, fb: PromiseBox<B>) => PromiseBox<A>
    '$>': <A, B>(fa: PromiseBox<A>, b: B) => PromiseBox<B>
    '<&>': <A, B>(fa: PromiseBox<A>, f: (a: A) => B) => PromiseBox<B>

    pure<A>(a:A): PromiseBox<A>
    lift<A, B>(fab: PromiseBox<Application<A, B>>, fa: PromiseBox<A>): PromiseBox<B>
    '<*>'<A, B>(fab: PromiseBox<Application<A, B>>, fa: PromiseBox<A>): PromiseBox<B>
    liftA<A, B>(f: Application<A, B>, fa: PromiseBox<A>): PromiseBox<B>
    liftA2<A, B, C, X extends Application2<A, B, C>>(
        abc: X, fa: PromiseBox<A>, fb: PromiseBox<B>): PromiseBox<C>
    liftA3<A, B, C, D>(
        f: Application3<A, B, C, D>,
        fa: PromiseBox<A>,
        fb: PromiseBox<B>,
        fc: PromiseBox<C>): PromiseBox<D>
    '*>'<A, B>(fa: PromiseBox<A>, fb: PromiseBox<B>): PromiseBox<B>
    '<*'<A, B>(fa: PromiseBox<A>, fb: PromiseBox<B>): PromiseBox<A>
    '<**>'<A, B>(fa: PromiseBox<A>, fab: PromiseBox<Application<A, B>>): PromiseBox<B>

    '>>='<A, B>(ma: PromiseBox<A>, action: Application<A, PromiseBox<B>>): PromiseBox<B>
    '>>'<A, B>(ma: PromiseBox<A>, mb: PromiseBox<B>): PromiseBox<B>
    return<A>(a: A) : PromiseBox<A>
    fail<A>(value: string): PromiseBox<A>
}

const implementation = {
    '>>='<A, B>(ma: PromiseBox<A>, action: Application<A, PromiseBox<B>>): PromiseBox<B> {
        ma = ma || Promise.resolve()
        action = action || (() => Promise.resolve())

        const result = (ma as Promise<A>).then(data =>
            action(data) as Promise<B>
        )

        return result
    },

    fail<A>(a: string): PromiseBox<A> {
        return Promise.reject(a) as PromiseBox<A>
    },

    isOfType<A>(a:A) {
        return a instanceof Promise
    }
} as IMonadBase<IsPromise>

export const monad = monadBase(implementation, applicative) as IPromiseMonad