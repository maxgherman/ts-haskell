import { Box } from '@common/types/box';
import { Writer } from '@data/writer';

export class IsWriter {}

export type WriterBox<TLog, T> = Box<IsWriter, T> & Writer<TLog, T>
