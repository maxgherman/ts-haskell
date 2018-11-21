import { identity } from 'ramda';
import {
    IApplicative, Application,
    Application2, Application3,
    applicative as appBase } from '@control/common/applicative';
import { List } from '@data/list';
import { functor } from '@control/functor/list';
import { IsList, ListBox } from '@common/types/list-box';

export interface IListApplicative extends IApplicative<IsList> {
    fmap: <A, B>(f: (a: A) => B, fa: ListBox<A>) => ListBox<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ListBox<A>) => ListBox<B>;
    '<$': <A, B>(a: A, fb: ListBox<B>) => ListBox<A>;
    '$>': <A, B>(fa: ListBox<A>, b: B) => ListBox<B>;
    '<&>': <A, B>(fa: ListBox<A>, f: (a: A) => B) => ListBox<B>;
    pure<A>(a:A): ListBox<A>;
    lift<A, B>(fab: ListBox<Application<A, B>>, fa: ListBox<A>): ListBox<B>;
    '<*>'<A, B>(fab: ListBox<Application<A, B>>, fa: ListBox<A>): ListBox<B>;
    liftA<A, B>(f: Application<A, B>, fa: ListBox<A>): ListBox<B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: ListBox<A>, fb: ListBox<B>): ListBox<C>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: ListBox<A>, fb: ListBox<B>, fc: ListBox<C>): ListBox<D>; 
    '*>'<A, B>(fa: ListBox<A>, fb: ListBox<B>): ListBox<B>;
    '<*'<A, B>(fa: ListBox<A>, fb: ListBox<B>): ListBox<A>;
    '<**>'<A, B>(fa: ListBox<A>, fab: ListBox<Application<A, B>>): ListBox<B>;
}

const pure = <A>(a:A): ListBox<A> => {
    return List.single(a);
}

const lift = <A, B>(fab: ListBox<Application<A, B>>, fa: ListBox<A>): ListBox<B> => {
    fab = fab || List.empty();
    fa = fa || List.empty();

    return fab.reduce((acc, curr) => {
        curr = curr || (identity as Application<A, B>);
        const elements = functor.fmap(curr, fa);
        return acc["++"](elements);
    }, List.empty<B>());
 }

 export const applicative = appBase(functor, { pure, lift }) as IListApplicative;