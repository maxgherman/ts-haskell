import { identity } from 'ramda';
import { IApplicative, applicative as appBase } from '@control/common/applicative';
import { BoxedArray } from '@data/boxed-array';
import { functor } from '@control/functor/boxed-array';
import { Application, Application2, Application3 } from '@common/types/application';
import { IsBoxedArray, BoxedArrayBox } from '@common/types/boxed-array-box';

export interface IBoxedArrayApplicative extends IApplicative<IsBoxedArray> {
    fmap: <A, B>(f: (a: A) => B, fa: BoxedArrayBox<A>) => BoxedArrayBox<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: BoxedArrayBox<A>) => BoxedArrayBox<B>;
    '<$': <A, B>(a: A, fb: BoxedArrayBox<B>) => BoxedArrayBox<A>;
    '$>': <A, B>(fa: BoxedArrayBox<A>, b: B) => BoxedArrayBox<B>;
    '<&>': <A, B>(fa: BoxedArrayBox<A>, f: (a: A) => B) => BoxedArrayBox<B>;
    pure<A>(a:A): BoxedArrayBox<A>;
    lift<A, B>(fab: BoxedArrayBox<Application<A, B>>, fa: BoxedArrayBox<A>): BoxedArrayBox<B>;
    '<*>'<A, B>(fab: BoxedArrayBox<Application<A, B>>, fa: BoxedArrayBox<A>): BoxedArrayBox<B>;
    liftA<A, B>(f: Application<A, B>, fa: BoxedArrayBox<A>): BoxedArrayBox<B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: BoxedArrayBox<A>, fb: BoxedArrayBox<B>): BoxedArrayBox<C>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: BoxedArrayBox<A>, fb: BoxedArrayBox<B>, fc: BoxedArrayBox<C>): BoxedArrayBox<D>; 
    '*>'<A, B>(fa: BoxedArrayBox<A>, fb: BoxedArrayBox<B>): BoxedArrayBox<B>;
    '<*'<A, B>(fa: BoxedArrayBox<A>, fb: BoxedArrayBox<B>): BoxedArrayBox<A>;
    '<**>'<A, B>(fa: BoxedArrayBox<A>, fab: BoxedArrayBox<Application<A, B>>): BoxedArrayBox<B>;
}

const pure = <A>(a:A): BoxedArrayBox<A> => {
    const result = a === null || a === undefined ? [] : [a]; 
    return BoxedArray.from(result);
}

const lift = <A, B>(fab: BoxedArrayBox<Application<A, B>>, fa: BoxedArrayBox<A>): BoxedArrayBox<B> => {
    fab = fab || BoxedArray.from([]);
    fa = fa || BoxedArray.from([]);
    
    const data = fab.value.reduce((acc, curr) => {
        curr = curr || (identity as Application<A, B>);
        const elements = functor.fmap(curr, fa);
        return acc.concat((elements as BoxedArray<B>).value);
    }, [] as B[]);
    
    return BoxedArray.from(data);
}

export const applicative = appBase(functor, { pure, lift }) as IBoxedArrayApplicative;