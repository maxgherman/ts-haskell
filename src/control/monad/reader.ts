import { identity, compose } from 'ramda'
import { Application, Application2, Application3 } from '@common/types/application'
import { Reader } from '@data/reader'
import { IsReader, ReaderBox } from '@common/types/reader-box'
import { IMonad, IMonadBase, monad as monadBase } from '@control/common/monad'
import { applicative } from '@control/applicative/reader'

export interface IReaderMonad<T> extends IMonad<IsReader> {
    fmap: <A, B>(f: (a: A) => B, fa: ReaderBox<T, A>) => ReaderBox<T, B>
    '<$>': <A, B>(f: (a: A) => B, fa: ReaderBox<T, A>) => ReaderBox<T, B>
    '<$': <A, B>(a: A, fb: ReaderBox<T, B>) => ReaderBox<T, A>
    '$>': <A, B>(fa: ReaderBox<T, A>, b: B) => ReaderBox<T, B>
    '<&>': <A, B>(fa: ReaderBox<T, A>, f: (a: A) => B) => ReaderBox<T, B>

    pure<A>(a:A): ReaderBox<T, A>
    lift<A, B>(fab: ReaderBox<T, Application<A, B>>, fa: ReaderBox<T, A>): ReaderBox<T, B>
    '<*>'<A, B>(fab: ReaderBox<T, Application<A, B>>, fa: ReaderBox<T, A>): ReaderBox<T, B>
    liftA<A, B>(f: Application<A, B>, fa: ReaderBox<T, A>): ReaderBox<T, B>
    liftA2<A, B, C, X extends Application2<A, B, C>>(
        abc: X, fa: ReaderBox<T, A>, fb: ReaderBox<T, B>): ReaderBox<T, C>
    liftA3<A, B, C, D>(
        f: Application3<A, B, C, D>,
        fa: ReaderBox<T, A>,
        fb: ReaderBox<T, B>,
        fc: ReaderBox<T, C>): ReaderBox<T, D>
    '*>'<A, B>(fa: ReaderBox<T, A>, fb: ReaderBox<T, B>): ReaderBox<T, B>
    '<*'<A, B>(fa: ReaderBox<T, A>, fb: ReaderBox<T, B>): ReaderBox<T, A>
    '<**>'<A, B>(fa: ReaderBox<T, A>, fab: ReaderBox<T, Application<A, B>>): ReaderBox<T, B>

    '>>='<A, B>(ma: ReaderBox<T, A>, action: Application<A, ReaderBox<T, B>>): ReaderBox<T, B>
    '>>'<A, B>(ma: ReaderBox<T, A>, mb: ReaderBox<T, B>): ReaderBox<T, B>
    return<A>(a: A) : ReaderBox<T, A>
    fail<A>(value: string): ReaderBox<T, A>
}

const implementation = {
    '>>='<R, A, B>(ma: ReaderBox<R, A>, action: Application<A, ReaderBox<R, B>>): ReaderBox<R, B> {
        ma = ma || Reader.from(identity as Application<R, A>)
        action = action || (() => Reader.from(identity as Application<R, B>))

        return Reader.from((r:R) =>
            compose(
                x => x.runReader(r),
                action,
                ma.runReader
            )(r)
        )
    },

    fail<R, A>(_: string): ReaderBox<R, A> {
        return Reader.from(identity as Application<R, A>)
    },

    isOfType<A>(a:A) {
        return a instanceof Reader
    }
} as IMonadBase<IsReader>

export const monad = <T>() => monadBase(implementation, applicative<T>()) as IReaderMonad<T>