import { Box2, Kind, Type } from 'data/kind'

export type Left<T> = () => NonNullable<T>
export type Right<T> = () => NonNullable<T>

export type Either<TL, TR> = Left<TL> | Right<TR>

export type EitherBox<T1, T2> = Box2<T1, T2> & Either<T1, T2>

type InnerEither<TL, TR> = Left<TL> &
    Right<TR> & {
        from: 'Left' | 'Right'
    }

type Case<TL, TR, K> = {
    left?: NonNullable<(_: TL) => K>
    right?: NonNullable<(_: TR) => K>
}

export const kindOf =
    <TL, TR>(_: Either<TL, TR>): Kind =>
    (_: '*') =>
    (_: '*') =>
        '*' as Type

const createResult = <T>(value: NonNullable<T>, from: 'Left' | 'Right') => {
    const result = () => value
    result.from = from
    result.kind = (_: '*') => (_: '*') => '*' as Type

    return result
}

export const left = <TL, TR = unknown>(value: NonNullable<TL>): EitherBox<TL, TR> => createResult<TL>(value, 'Left')

export const right = <TL, TR>(value: NonNullable<TR>): EitherBox<TL, TR> => createResult<TR>(value, 'Right')

export const $case =
    <TL, TR, K>(caseOf: Case<TL, TR, K>) =>
    (either: Either<TL, TR> | EitherBox<TL, TR>): K => {
        const _either = either as InnerEither<TL, TR>

        if (_either.from === 'Left') {
            if (!caseOf.left) {
                throw new Error('Non-exhaustive patterns for Left')
            }

            return caseOf.left((either as Left<TL>)())
        }

        if (_either.from === 'Right') {
            if (!caseOf.right) {
                throw new Error('Non-exhaustive patterns for Right')
            }

            return caseOf.right((either as Right<TR>)())
        }

        throw new Error('Non-exhaustive patterns')
    }
