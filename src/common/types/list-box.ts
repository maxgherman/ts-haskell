import { Box } from '@common/types/box';
import { List } from '@data/list';

export class IsList {}

export type ListBox<T> = Box<IsList, T> & List<T>;
