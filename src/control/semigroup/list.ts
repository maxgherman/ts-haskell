import { ISemigroup, semigroup as baseSemigroup }  from '@control/common/semigroup';
import { List } from '@data/list';
import { IsList, ListBox } from '@common/types/list-box';

export interface IListSemigroup extends ISemigroup<IsList> {
    '<>'<A>(a: ListBox<A>, b: ListBox<A>): ListBox<A>;
}

const base = {
    '<>'<A>(a: ListBox<A>, b: ListBox<A>) {
        a = a || List.empty();
        b = b || List.empty();

        return a['++'](b);
    }
};

export const semigroup = baseSemigroup(base) as IListSemigroup;