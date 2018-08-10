import { semigroup, WriterSemigroup } from '@control/semigroup/writer';
import { IMonoid } from '@common/types/monoid';
import { Writer } from '@data/writer';

// export interface IWriterMonoid<T, A> extends IMonoid<Writer<T, A>>, IWriterSemigroup<T, A> {
//     '<>'(a: Writer<T, A>, b: Writer<T, A>): Writer<T, A>;
//     mempty(): Writer<T, A>;
//     mappend(a: Writer<T, A>, b: Writer<T, A>): Writer<T, A>;
//     mconcat(array: [Writer<T, A>]): Writer<T, A>;
// }

