import { useWith, always, flip } from 'ramda';

export class Box<F, T> { }

export interface IBaseFunctor<F> {
    fmap<A, B>(f: (a: A) => B, fa: Box<F, A>) : Box<F, B>;
}

export interface IFunctor<F> extends IBaseFunctor<F> {
    '<$>'<A, B>(f: (a: A) => B, fa: Box<F, A>): Box<F, B>;
    '<$'<A, B>(a: A, fb: Box<F, B>): Box<F, A>;
    '$>'<A, B>(fa: Box<F, A>, b: B): Box<F, B>;
    '<&>'<A, B>(fa: Box<F, A>, f: (a: A) => B): Box<F, B>;
}

export const functor = <F>(base: IBaseFunctor<F>): IFunctor<F> => {
    const removeBackwards = useWith(base.fmap, [always]);
    
    const extensions = {
      // <$> :: Functor f => (a -> b) ->  f a -> f b
        '<$>': base.fmap,  

      // <$ :: Functor f => a -> f b -> f a
        '<$': removeBackwards,

      // <$ :: Functor f => f a -> b -> f a
        '$>': flip(removeBackwards),

     // <&> :: Functor f => f a -> (a -> b) -> f b
        '<&>': flip(base.fmap)
    } as IFunctor<F>;
    
    return {
        ...base,
        ...extensions
    };
};
