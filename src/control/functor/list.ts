import { identity } from 'ramda'
import { functor as baseFunctor, IFunctor } from '@control/common/functor'
import { List } from '@data/list'
import { IsList, ListBox } from '@common/types/list-box'

export interface IListBoxFunctor extends IFunctor<IsList> {
    fmap: <A, B>(f: (a: A) => B, fa: ListBox<A>) => ListBox<B>
    '<$>': <A, B>(f: (a: A) => B, fa: ListBox<A>) => ListBox<B>
    '<$': <A, B>(a: A, fb: ListBox<B>) => ListBox<A>
    '$>': <A, B>(fa: ListBox<A>, b: B) => ListBox<B>
    '<&>': <A, B>(fa: ListBox<A>, f: (a: A) => B) => ListBox<B>
}

const fmap = <A, B>(f: (a: A) => B, fa: ListBox<A>): ListBox<B> => {
    f = f || (identity as (a: A) => B)
    fa = fa || List.empty()
    return fa.map(f)
}

export const functor = baseFunctor<IsList>({ fmap }) as IListBoxFunctor
