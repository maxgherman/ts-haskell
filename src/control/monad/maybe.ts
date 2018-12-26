import { identity } from 'ramda';
import { Application, Application2, Application3 } from '@common/types/application';
import { IsMaybe, MaybeBox } from '@common/types/maybe-box';
import { Maybe } from '@data/maybe';
import { IMonad, IMonadBase, monad as monadBase } from '@control/common/monad';
import { applicative } from '@control/applicative/maybe';

export interface IMaybeMonad extends IMonad<IsMaybe> {
    fmap: <A, B>(f: (a: A) => B, fa: MaybeBox<A>) => MaybeBox<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: MaybeBox<A>) => MaybeBox<B>;
    '<$': <A, B>(a: A, fb: MaybeBox<B>) => MaybeBox<A>;
    '$>': <A, B>(fa: MaybeBox<A>, b: B) => MaybeBox<B>;
    '<&>': <A, B>(fa: MaybeBox<A>, f: (a: A) => B) => MaybeBox<B>;

    pure<A>(a:A): MaybeBox<A>;
    lift<A, B>(fab: MaybeBox<Application<A, B>>, fa: MaybeBox<A>): MaybeBox<B>;
    '<*>'<A, B>(fab: MaybeBox<Application<A, B>>, fa: MaybeBox<A>): MaybeBox<B>;
    liftA<A, B>(f: Application<A, B>, fa: MaybeBox<A>): MaybeBox<B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<C>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: MaybeBox<A>, fb: MaybeBox<B>, fc: MaybeBox<C>): MaybeBox<D>; 
    '*>'<A, B>(fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<B>;
    '<*'<A, B>(fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<A>;
    '<**>'<A, B>(fa: MaybeBox<A>, fab: MaybeBox<Application<A, B>>): MaybeBox<B>;
    
    '>>='<A,B>(ma: MaybeBox<A>, action: Application<A, MaybeBox<B>>): MaybeBox<B>;
    '>>'<A,B>(ma: MaybeBox<A>, mb: MaybeBox<B>): MaybeBox<B>;
    return<A>(a: A) : MaybeBox<A>;
    fail<A>(value: string): MaybeBox<A>;
}

const implementation = {
    ">>="<A,B>(ma: MaybeBox<A>, action: Application<A, MaybeBox<B>>): MaybeBox<B> {
        ma = ma || Maybe.nothing();
        action = action || identity as Application<A, MaybeBox<B>>;

        return ma.isNothing ? Maybe.nothing() : action(ma.value);
    },

    fail<A>(_: string): MaybeBox<A> {
        return Maybe.nothing();
    }
} as IMonadBase<IsMaybe>;

export const monad = monadBase(implementation, applicative) as IMaybeMonad;
