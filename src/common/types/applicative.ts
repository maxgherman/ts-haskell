import { useWith, always, identity, partial } from 'ramda';
import { IFunctor } from '@common/types/functor';
import { Box } from '@common/types/box';
import { applyReverse } from '@common/utils';

export type Application<A, B> = (a: A) => B;

export type Application2<A, B, C> = (a: A) => (b: B) => C;

export type Application3<A, B, C, D> = (a: A) => (b: B) => (c: C) => D;

export interface IApplicativeBase<F> {
    pure<A>(a:A): Box<F, A>;
    lift<A, B>(fab: Box<F, Application<A, B>>, fa: Box<F, A>): Box<F, B>;
}

export interface IApplicative<F> extends IFunctor<F>, IApplicativeBase<F> {
   //liftA2 :: (a -> b -> c) -> f a -> f b -> f c
    liftA2<A, B, C>(abc: Application2<A, B, C>, fa: Box<F, A>, fb: Box<F, B>): Box<F, C>;
 
   //(*>) :: f a -> f b -> f b
    '*>'<A, B>(fa: Box<F, A>, fb: Box<F, B>): Box<F, B>;
 
   // (<*) :: f a -> f b -> f a
    '<*'<A, B>(fa: Box<F, A>, fb: Box<F, B>): Box<F, A>;
   
   // (<**>) :: Applicative f => f a -> f (a -> b) -> f b
    '<**>'<A, B>(fa: Box<F, A>, fab: Box<F, Application<A, B>>): Box<F, B>;
 
  // liftA :: Applicative f => (a -> b) -> f a -> f b
    liftA<A, B>(f: Application<A, B>, fa: Box<F, A>): Box<F, B>;
  
  // liftA3 :: Applicative f => (a -> b -> c -> d) -> f a -> f b -> f c -> f d
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: Box<F, A>, fb: Box<F, B>, fc: Box<F, C>): Box<F, D>; 
}

export const applicative = <F>(f: IFunctor<F>, base: IApplicativeBase<F>): IApplicative<F> => {
    
    const liftA2 = <A, B, C>(abc: Application2<A, B, C>, fa: Box<F, A>, fb: Box<F, B>): Box<F, C> => {
        return base.lift(f.fmap(abc, fa), fb);
    };

    const extensions = {
        liftA2,

        '*>'<A, B>(fa: Box<F, A>, fb: Box<F, B>): Box<F, B> {
            return base.lift(f['<$'](identity, fa), fb);
        },

        '<*': partial(liftA2, [always]),

        '<**>': partial(liftA2, [applyReverse]),

        liftA<A, B>(f: Application<A, B>, fa: Box<F, A>): Box<F, B> {
            return base.lift(base.pure(f), fa);
        },

        liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: Box<F, A>, fb: Box<F, B>, fc: Box<F, C>): Box<F, D> {
            const action = liftA2(useWith(f, []), fa, fb);
            return base.lift(action, fc);
        }
    } as IApplicative<F>;

    return {
        ...f,
        ...base,
        ...extensions
    };
};