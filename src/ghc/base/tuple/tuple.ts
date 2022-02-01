import { Box0, Box2, Kind, MinBox0 } from 'data/kind'

export type UnitBox = [] & Box0

export type Tuple2Box<T1, T2> = [T1, T2] & Box2<T1, T2>

export type TupleMinBox<T1, T2> = Tuple2Box<MinBox0<T1>, MinBox0<T2>>

export type Tuple2BoxT<T, A> = Tuple2Box<MinBox0<T>, A>

export const fst = <T1, T2>(tuple: [T1, T2] | Tuple2Box<T1, T2>): T1 => tuple[0]

export const snd = <T1, T2>(tuple: [T1, T2] | Tuple2Box<T1, T2>): T2 => tuple[1]

export const unit = (): UnitBox =>
    Object.create([], {
        kind: {
            value: '*' as Kind,
        },
    })

export const tuple2 = <T1, T2>(a: T1, b: T2): Tuple2Box<T1, T2> =>
    Object.create([a, b], {
        kind: {
            value: (_: '*') => (_: '*') => '*' as Kind,
        },
    })

export const curry =
    <T1, T2, T3>(f: (_: T1, __: T2) => T3) =>
    (a: T1) =>
    (b: T2): T3 =>
        f(a, b)
