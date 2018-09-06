import { identity } from 'ramda';
import { IApplicative, Application, Application2, Application3, applicative as appBase } from '@common/types/applicative';
import { functor  } from '@control/functor/plain-array';
import { IsPlainArray, ArrayBox } from '@control/plain-array';

export interface IPlainArrayApplicative extends IApplicative<IsPlainArray> {
    fmap: <A, B>(f: (a: A) => B, fa: ArrayBox<A>) => ArrayBox<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ArrayBox<A>) => ArrayBox<B>;
    '<$': <A, B>(a: A, fb: ArrayBox<B>) => ArrayBox<A>;
    '$>': <A, B>(fa: ArrayBox<A>, b: B) => ArrayBox<B>;
    '<&>': <A, B>(fa: ArrayBox<A>, f: (a: A) => B) => ArrayBox<B>;
    pure<A>(a:A): ArrayBox<A>;
    lift<A, B>(fab: ArrayBox<Application<A, B>>, fa: ArrayBox<A>): ArrayBox<B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: ArrayBox<A>, fb: ArrayBox<B>): ArrayBox<C>;
    '*>'<A, B>(fa: ArrayBox<A>, fb: ArrayBox<B>): ArrayBox<B>;
    '<*'<A, B>(fa: ArrayBox<A>, fb: ArrayBox<B>): ArrayBox<A>;
    '<**>'<A, B>(fa: ArrayBox<A>, fab: ArrayBox<Application<A, B>>): ArrayBox<B>;
    liftA<A, B>(f: Application<A, B>, fa: ArrayBox<A>): ArrayBox<B>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: ArrayBox<A>, fb: ArrayBox<B>, fc: ArrayBox<C>): ArrayBox<D>; 
}

const pure = <A>(a: A): ArrayBox<A> => {
    return [a];
}  

const lift = <A, B>(fab: ArrayBox<Application<A, B>>, fa: ArrayBox<A>): ArrayBox<B> => {
    fab = fab || [];
    fa = fa || [];
    
    return fab.reduce((acc, curr) => {
        curr = curr || (identity as Application<A, B>);
        const elements = functor.fmap(curr, fa);
        return acc.concat(elements);
    }, [] as ArrayBox<B>);
}

export const applicative = appBase(functor, { pure, lift }) as IPlainArrayApplicative;