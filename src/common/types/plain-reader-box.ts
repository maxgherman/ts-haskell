import { Box } from '@common/types/box';
import { Application } from '@common/types/application';

export class IsPlainReader {}

export type PlainReaderBox<T1, T2> = Box<IsPlainReader, T1> & Application<T1, T2>;
