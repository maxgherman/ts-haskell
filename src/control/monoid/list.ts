import { IMonoid, IMonoidBase, monoid as monoidBase } from '@control/common/monoid';
import { semigroup } from '@control/semigroup/list';
import { IsList, ListBox } from '@common/types/list-box';
import { List } from '@data/list';

export interface IListMonoid extends IMonoid<IsList> {
    mempty<A>(): ListBox<A>;
    mappend<A>(a: ListBox<A>, b: ListBox<A>): ListBox<A>;
    mconcat<A>(array: Array<ListBox<A>>): ListBox<A>;
    '<>'<A>(a: ListBox<A>, b: ListBox<A>): ListBox<A>;
}

const base: IMonoidBase<IsList> = {
    mempty<A>(): ListBox<A> {
        return List.empty();
    }
}

export const monoid: IListMonoid = monoidBase(semigroup, base) as IListMonoid;