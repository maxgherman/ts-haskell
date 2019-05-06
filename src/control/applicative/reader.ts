import { identity, always } from 'ramda'
import { IApplicative, applicative as appBase } from '@control/common/applicative'
import { IsReader, ReaderBox } from '@common/types/reader-box'
import { functor } from '@control/functor/reader'
import { Reader } from '@data/reader'
import { Application, Application2, Application3 } from '@common/types/application'

export interface IReaderApplicative<T> extends IApplicative<IsReader> {
    fmap: <A, B>(f: (a: A) => B, fa: ReaderBox<T, A>) => ReaderBox<T, B>
    '<$>': <A, B>(f: (a: A) => B, fa: ReaderBox<T, A>) => ReaderBox<T, B>
    '<$': <A, B>(a: A, fb: ReaderBox<T, B>) => ReaderBox<T, A>
    '$>': <A, B>(fa: ReaderBox<T, A>, b: B) => ReaderBox<T, B>
    '<&>': <A, B>(fa: ReaderBox<T, A>, f: (a: A) => B) => ReaderBox<T, B>
    pure<A>(a:A): ReaderBox<T, A>
    lift<A, B>(fab: ReaderBox<T, Application<A, B>>, fa: ReaderBox<T, A>): ReaderBox<T, B>
    '<*>'<A, B>(fab: ReaderBox<T, Application<A, B>>, fa: ReaderBox<T, A>): ReaderBox<T, B>
    liftA<A, B>(f: Application<A, B>, fa: ReaderBox<T, A>): ReaderBox<T, B>
    liftA2<A, B, C>(
        abc: Application2<A, B, C>, fa: ReaderBox<T, A>, fb: ReaderBox<T, B>): ReaderBox<T, C>;
    liftA3<A, B, C, D>(
        f: Application3<A, B, C, D>,
        fa: ReaderBox<T, A>,
        fb: ReaderBox<T, B>,
        fc: ReaderBox<T, C>): ReaderBox<T, D>
    '*>'<A, B>(fa: ReaderBox<T, A>, fb: ReaderBox<T, B>): ReaderBox<T, B>
    '<*'<A, B>(fa: ReaderBox<T, A>, fb: ReaderBox<T, B>): ReaderBox<T, A>
    '<**>'<A, B>(fa: ReaderBox<T, A>, fab: ReaderBox<T, Application<A, B>>): ReaderBox<T, B>
}

// pure a = \_ -> a
const pure = <R, A>(a: A) => Reader.from((_: R) => a)

// f <*> g = \x -> f x (g x)
const lift =
    <R, A, B>(fab: ReaderBox<R, Application<A, B>>, fa: ReaderBox<R, A>): ReaderBox<R, B> => {

        // fab :: r -> a -> b
        fab = fab ||  Reader.from(always(identity as Application<A, B>))
        fa = fa || Reader.from(identity as Application<R, A>) as ReaderBox<R, A>

        return Reader.from((x: R) => {
            const fax = fa.runReader(x)
            return fab.runReader(x)(fax)
        })
    }

export const applicative = <T>(): IReaderApplicative<T> => {
    const f = functor<T>()
    return appBase(f, { pure, lift }) as IReaderApplicative<T>
}
