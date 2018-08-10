import { ISemigroup } from '@common/types/semigroup';
import { Writer, IWriter } from '@data/writer';

export type WriterSemigroup<T, A> = IWriter<ISemigroup<T>, A>;

// export interface IWriterSemigroup<K, A, T extends Writer<K, A>> extends ISemigroup<K> {
//     '<>'(a: K, b: K): K;
// }

// export interface IWriterSemigroup<T, A> extends ISemigroup<Writer<T, A>> { 
//     '<>'(a: Writer<T, A>, b: Writer<T, A>): Writer<T, A>;
// }

export const semigroup = <T,A>(value: [A, ISemigroup<T>]): WriterSemigroup<T, A> => Writer.from(value);