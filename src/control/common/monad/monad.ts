import { Box } from '@common/types/box'
import { Application } from '@common/types/application'
import { IApplicative } from '@control/common/applicative'

export interface IMonadBase<F> {
 // (>>=) :: forall a b. m a -> (a -> m b) -> m b
    '>>='<A, B>(ma: Box<F, A>, action: Application<A, Box<F, B>>): Box<F, B>

 // fail   :: String -> m a
    fail?<A>(value: string): Box<F, A>;

    isOfType<A>(a:A): boolean;
}

export interface IMonad<F> extends IMonadBase<F>, IApplicative<F> {
 // (>>)   :: m a -> m b -> m b
    '>>'<A, B>(ma: Box<F, A>, mb: Box<F, B>): Box<F, B>

 // return :: a -> m a
    return<A>(a: A) : Box<F, A>
}

export const monad = <F>(base: IMonadBase<F>, applicative: IApplicative<F>): IMonad<F> => {
    return {
        ...applicative,
        return: applicative.pure,
        '>>': applicative['*>'],
        ...base,
        fail: base.fail || ((value) => { throw value }),
    }
}