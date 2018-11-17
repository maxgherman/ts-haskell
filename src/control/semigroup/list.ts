import { ISemigroup }  from '@control/common/semigroup';
import { List } from '@data/list';
import { IsList, ListBox } from '@common/types/list-box';

export interface IListSemigroup extends ISemigroup<IsList> {
    '<>'<A>(a: ListBox<A>, b: ListBox<A>): ListBox<A>;
}

export const semigroup: IListSemigroup = {
    '<>'<A>(a: ListBox<A>, b: ListBox<A>) {
        a = a || List.empty();
        b = b || List.empty();

        return a['++'](b);
    }
}