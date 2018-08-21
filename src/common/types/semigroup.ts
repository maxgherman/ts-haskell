import { Box } from '@common/types/box';

export interface ISemigroup<F> {
    '<>'<R>(a: Box<F, R>, b: Box<F, R>): Box<F, R>;    
}