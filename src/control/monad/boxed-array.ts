import { Application, Application2, Application3 } from '@common/types/application'
import { BoxedArray } from '@data/boxed-array'
import { IsBoxedArray, BoxedArrayBox } from '@common/types/boxed-array-box'
import { IMonad, IMonadBase, monad as monadBase } from '@control/common/monad'
import { applicative } from '@control/applicative/boxed-array'

export interface IBoxedArrayMonad extends IMonad<IsBoxedArray> {
    fmap: <A, B>(f: (a: A) => B, fa: BoxedArrayBox<A>) => BoxedArrayBox<B>
    '<$>': <A, B>(f: (a: A) => B, fa: BoxedArrayBox<A>) => BoxedArrayBox<B>
    '<$': <A, B>(a: A, fb: BoxedArrayBox<B>) => BoxedArrayBox<A>
    '$>': <A, B>(fa: BoxedArrayBox<A>, b: B) => BoxedArrayBox<B>
    '<&>': <A, B>(fa: BoxedArrayBox<A>, f: (a: A) => B) => BoxedArrayBox<B>

    pure<A>(a:A): BoxedArrayBox<A>
    lift<A, B>(fab: BoxedArrayBox<Application<A, B>>, fa: BoxedArrayBox<A>): BoxedArrayBox<B>
    '<*>'<A, B>(fab: BoxedArrayBox<Application<A, B>>, fa: BoxedArrayBox<A>): BoxedArrayBox<B>
    liftA<A, B>(f: Application<A, B>, fa: BoxedArrayBox<A>): BoxedArrayBox<B>
    liftA2<A, B, C, X extends Application2<A, B, C>>(
        abc: X, fa: BoxedArrayBox<A>, fb: BoxedArrayBox<B>): BoxedArrayBox<C>;
    liftA3<A, B, C, D>(
        f: Application3<A, B, C, D>,
        fa: BoxedArrayBox<A>,
        fb: BoxedArrayBox<B>, fc: BoxedArrayBox<C>): BoxedArrayBox<D>
    '*>'<A, B>(fa: BoxedArrayBox<A>, fb: BoxedArrayBox<B>): BoxedArrayBox<B>
    '<*'<A, B>(fa: BoxedArrayBox<A>, fb: BoxedArrayBox<B>): BoxedArrayBox<A>
    '<**>'<A, B>(fa: BoxedArrayBox<A>, fab: BoxedArrayBox<Application<A, B>>): BoxedArrayBox<B>

    '>>='<A, B>(ma: BoxedArrayBox<A>, action: Application<A, BoxedArrayBox<B>>): BoxedArrayBox<B>
    '>>'<A, B>(ma: BoxedArrayBox<A>, mb: BoxedArrayBox<B>): BoxedArrayBox<B>
    return<A>(a: A) : BoxedArrayBox<A>
    fail<A>(value: string): BoxedArrayBox<A>
}

const implementation = {
    '>>='<A, B>(ma: BoxedArrayBox<A>, action: Application<A, BoxedArrayBox<B>>): BoxedArrayBox<B> {
        ma = ma || BoxedArray.from([])
        action = action || ((_) => BoxedArray.from([]))

        const result = ma.value.reduce((acc, curr) =>
            acc.concat(action(curr).value),
            []
        )

        return BoxedArray.from(result)
    },

    fail<A>(_: string): BoxedArrayBox<A> {
        return BoxedArray.from([])
    },

    isOfType<A>(a:A) {
        return a instanceof BoxedArray
    }
} as IMonadBase<IsBoxedArray>

export const monad = monadBase(implementation, applicative) as IBoxedArrayMonad