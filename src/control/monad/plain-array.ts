import { Application, Application2, Application3 } from '@common/types/application';
import { IsPlainArray, ArrayBox } from '@common/types/plain-array-box';
import { IMonad, IMonadBase, monad as monadBase } from '@control/common/monad';
import { applicative } from '@control/applicative/plain-array';

export interface IPlainArrayMonad extends IMonad<IsPlainArray> {
    fmap: <A, B>(f: (a: A) => B, fa: ArrayBox<A>) => ArrayBox<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ArrayBox<A>) => ArrayBox<B>;
    '<$': <A, B>(a: A, fb: ArrayBox<B>) => ArrayBox<A>;
    '$>': <A, B>(fa: ArrayBox<A>, b: B) => ArrayBox<B>;
    '<&>': <A, B>(fa: ArrayBox<A>, f: (a: A) => B) => ArrayBox<B>;

    pure<A>(a:A): ArrayBox<A>;
    lift<A, B>(fab: ArrayBox<Application<A, B>>, fa: ArrayBox<A>): ArrayBox<B>;
    '<*>'<A, B>(fab: ArrayBox<Application<A, B>>, fa: ArrayBox<A>): ArrayBox<B>;
    liftA<A, B>(f: Application<A, B>, fa: ArrayBox<A>): ArrayBox<B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: ArrayBox<A>, fb: ArrayBox<B>): ArrayBox<C>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: ArrayBox<A>, fb: ArrayBox<B>, fc: ArrayBox<C>): ArrayBox<D>; 
    '*>'<A, B>(fa: ArrayBox<A>, fb: ArrayBox<B>): ArrayBox<B>;
    '<*'<A, B>(fa: ArrayBox<A>, fb: ArrayBox<B>): ArrayBox<A>;
    '<**>'<A, B>(fa: ArrayBox<A>, fab: ArrayBox<Application<A, B>>): ArrayBox<B>;
    
    '>>='<A,B>(ma: ArrayBox<A>, action: Application<A, ArrayBox<B>>): ArrayBox<B>;
    '>>'<A,B>(ma: ArrayBox<A>, mb: ArrayBox<B>): ArrayBox<B>;
    return<A>(a: A) : ArrayBox<A>;
    fail<A>(value: string): ArrayBox<A>;
}

const implementation = {
    ">>="<A,B>(ma: ArrayBox<A>, action: Application<A, ArrayBox<B>>): ArrayBox<B> {
        ma = ma || [];
        action = action || ((_) => []);

        return ma.reduce((acc, curr) => 
            acc.concat(action(curr)),
            []
        );
    },

    fail<A>(_: string): ArrayBox<A> {
        return [];
    },

    isOfType<A>(a:A) {
        return Array.isArray(a);
    }
} as IMonadBase<IsPlainArray>;

export const monad = monadBase(implementation, applicative) as IPlainArrayMonad;