import { identity } from 'ramda';
import { IApplicative, Application, Application2, Application3, applicative as appBase } from '@common/types';
import { BoxedArray } from '@data/boxed-array';
import { IsBoxedArray, functor, BoxedArrayF } from '@control/functor/boxed-array';

export interface IBoxedArrayApplicative extends IApplicative<IsBoxedArray> {
    fmap: <A, B>(f: (a: A) => B, fa: BoxedArrayF<A>) => BoxedArrayF<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: BoxedArrayF<A>) => BoxedArrayF<B>;
    '<$': <A, B>(a: A, fb: BoxedArrayF<B>) => BoxedArrayF<A>;
    '$>': <A, B>(fa: BoxedArrayF<A>, b: B) => BoxedArrayF<B>;
    '<&>': <A, B>(fa: BoxedArrayF<A>, f: (a: A) => B) => BoxedArrayF<B>;
    pure<A>(a:A): BoxedArrayF<A>;
    lift<A, B>(fab: BoxedArrayF<Application<A, B>>, fa: BoxedArrayF<A>): BoxedArrayF<B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: BoxedArrayF<A>, fb: BoxedArrayF<A>): BoxedArrayF<A>;
    '*>'<A, B, C>(fa: BoxedArrayF<A>, fb: BoxedArrayF<B>): BoxedArrayF<C>;
    '<*'<A, B, C>(fa: BoxedArrayF<A>, fb: BoxedArrayF<B>): BoxedArrayF<C>;
    '<**>'<A, B>(fa: BoxedArrayF<A>, fab: BoxedArrayF<Application<A, B>>): BoxedArrayF<B>;
    liftA<A, B>(f: Application<A, B>, fa: BoxedArrayF<A>): BoxedArrayF<B>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: BoxedArrayF<A>, fb: BoxedArrayF<B>, fc: BoxedArrayF<C>): BoxedArrayF<D>; 
}

const pure = <A>(a:A): BoxedArrayF<A> => {
    return BoxedArray.from([a]);
}

const lift = <A, B>(fab: BoxedArrayF<Application<A, B>>, fa: BoxedArrayF<A>): BoxedArrayF<B> => {
    fab = fab || BoxedArray.from([]);
    fa = fa || BoxedArray.from([]);
    
    const data = fab.value.reduce((acc, curr) => {
        curr = curr || (identity as Application<A, B>);
        const elements = functor.fmap((element) => curr(element) , fa);
        return acc.concat((elements as BoxedArray<B>).value);
    }, [] as B[]);
    
    return BoxedArray.from(data);
}

export const applicative = appBase(functor, { pure, lift }) as IBoxedArrayApplicative;