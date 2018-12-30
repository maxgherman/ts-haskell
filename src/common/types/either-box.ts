import { Box } from '@common/types/box';
import { Either } from '@data/either';

export class IsEither {}

export type EitherBox<T1, T2> = Box<IsEither, T1> & Either<T1, T2>
