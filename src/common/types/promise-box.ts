import { Box } from '@common/types/box'

export class IsPromise {}

export type PromiseBox<T> =
    Box<IsPromise, T> & Promise<T> |
    Box<IsPromise, T> & Promise<void>