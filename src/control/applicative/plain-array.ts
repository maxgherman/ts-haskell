import { identity } from 'ramda';
import { IApplicative, Application, Application2, applicative as appBase } from '@common/types';
import { ArrayF, IsPlainArray, functor  } from '@control/functor/plain-array';

export interface IPlainArrayApplicative extends IApplicative<IsPlainArray> {
    fmap: <A, B>(f: (a: A) => B, fa: ArrayF<A>) => ArrayF<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ArrayF<A>) => ArrayF<B>;
    '<$': <A, B>(a: A, fb: ArrayF<B>) => ArrayF<A>;
    '$>': <A, B>(fa: ArrayF<A>, b: B) => ArrayF<B>;
    '<&>': <A, B>(fa: ArrayF<A>, f: (a: A) => B) => ArrayF<B>;
    pure<A>(a:A): ArrayF<A>;
    lift<A, B>(fab: ArrayF<Application<A, B>>, fa: ArrayF<A>): ArrayF<B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: ArrayF<A>, fb: ArrayF<B>): ArrayF<A>;
}

const pure = <A>(a: A): ArrayF<A> => {
    return [a];
}  

const lift = <A, B>(fab: ArrayF<Application<A, B>>, fa: ArrayF<A>): ArrayF<B> => {
    fab = fab || [];
    fa = fa || [];
    
    return fab.reduce((acc, curr) => {
        curr = curr || (identity as Application<A, B>);
        const elements = functor.fmap((element) => curr(element), fa);
        return acc.concat(elements);
    }, [] as ArrayF<B>);
}

export const applicative = appBase(functor, { pure, lift }) as IPlainArrayApplicative;