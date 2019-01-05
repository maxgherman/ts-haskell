import { identity, compose } from 'ramda';
import { IsPlainReader, PlainReaderBox } from '@common/types/plain-reader-box';
import { functor as baseFunctor, IFunctor } from '@control/common/functor';
import { Application } from '@common/types/application';

export interface IPlainReaderFunctor<T> extends IFunctor<IsPlainReader> {
    fmap: <A, B>(f: (a: A) => B, fa: PlainReaderBox<T, A>) => PlainReaderBox<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: PlainReaderBox<T, A>) => PlainReaderBox<T, B>,
    '<$': <A, B>(a: A, fb: PlainReaderBox<T, B>) => PlainReaderBox<T, A>,
    '$>': <A, B>(fa: PlainReaderBox<T, A>, b: B) => PlainReaderBox<T, B>,
    '<&>': <A, B>(fa: PlainReaderBox<T, A>, f: (a: A) => B) => PlainReaderBox<T, B>
}

const fmap = <R, A, B>(f: (a: A) => B, fa: PlainReaderBox<R, A>): PlainReaderBox<R, B> => {
    f = f || (identity as Application<A, B>);
    fa = fa || (identity as PlainReaderBox<R, A>);
    
    return compose(f, fa);
};

export const functor = <T>(): IPlainReaderFunctor<T> =>
    baseFunctor<IsPlainReader>({ fmap }) as IPlainReaderFunctor<T>;
