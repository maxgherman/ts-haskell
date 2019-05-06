import { Box } from '@common/types/box'
import { BoxedArray } from '@data/boxed-array'

export class IsBoxedArray {}

export type BoxedArrayBox<T> = Box<IsBoxedArray, T> & BoxedArray<T>
