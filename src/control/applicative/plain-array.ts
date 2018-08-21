import { identity } from 'ramda';
import { IApplicative, Application, Application2, Application3, applicative as appBase } from '@common/types/applicative';
import { ArrayF, functor  } from '@control/functor/plain-array';
import {IsPlainArray } from '@control/plain-array';

export interface IPlainArrayApplicative extends IApplicative<IsPlainArray> {
    fmap: <A, B>(f: (a: A) => B, fa: ArrayF<A>) => ArrayF<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ArrayF<A>) => ArrayF<B>;
    '<$': <A, B>(a: A, fb: ArrayF<B>) => ArrayF<A>;
    '$>': <A, B>(fa: ArrayF<A>, b: B) => ArrayF<B>;
    '<&>': <A, B>(fa: ArrayF<A>, f: (a: A) => B) => ArrayF<B>;
    pure<A>(a:A): ArrayF<A>;
    lift<A, B>(fab: ArrayF<Application<A, B>>, fa: ArrayF<A>): ArrayF<B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: ArrayF<A>, fb: ArrayF<B>): ArrayF<C>;
    '*>'<A, B, C>(fa: ArrayF<A>, fb: ArrayF<B>): ArrayF<C>;
    '<*'<A, B, C>(fa: ArrayF<A>, fb: ArrayF<B>): ArrayF<C>;
    '<**>'<A, B>(fa: ArrayF<A>, fab: ArrayF<Application<A, B>>): ArrayF<B>;
    liftA<A, B>(f: Application<A, B>, fa: ArrayF<A>): ArrayF<B>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: ArrayF<A>, fb: ArrayF<B>, fc: ArrayF<C>): ArrayF<D>; 
}

const pure = <A>(a: A): ArrayF<A> => {
    return [a];
}  

const lift = <A, B>(fab: ArrayF<Application<A, B>>, fa: ArrayF<A>): ArrayF<B> => {
    fab = fab || [];
    fa = fa || [];
    
    return fab.reduce((acc, curr) => {
        curr = curr || (identity as Application<A, B>);
        const elements = functor.fmap(curr, fa);
        return acc.concat(elements);
    }, [] as ArrayF<B>);
}

export const applicative = appBase(functor, { pure, lift }) as IPlainArrayApplicative;