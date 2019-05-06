import { Box } from '@common/types/box'
import { Reader } from '@data/reader'

export class IsReader {}

export type ReaderBox<T, A> = Box<IsReader, T> & Reader<T, A>
