import { Box } from '@common/types/box'

export class IsPlainArray {}

export type ArrayBox<T> = Box<IsPlainArray, T> & T[]