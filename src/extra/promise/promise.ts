import { Box1, Kind } from 'data/kind'

export type PromiseBox<T> = Box1<T> & Promise<T>

export const kindOf = <T>(_: Promise<T>): Kind => '*'
