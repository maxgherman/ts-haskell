import { Box } from '@common/types/box';
import { Maybe } from '@data/maybe';

export class IsMaybe {}

export type MaybeBox<T> = Box<IsMaybe, T> & Maybe<T>;
