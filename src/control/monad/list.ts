import { Application, Application2, Application3 } from '@common/types/application'
import { List } from '@data/list'
import { IsList, ListBox } from '@common/types/list-box'
import { IMonad, IMonadBase, monad as monadBase } from '@control/common/monad'
import { applicative } from '@control/applicative/list'

export interface IListMonad extends IMonad<IsList> {
    fmap: <A, B>(f: (a: A) => B, fa: ListBox<A>) => ListBox<B>
    '<$>': <A, B>(f: (a: A) => B, fa: ListBox<A>) => ListBox<B>
    '<$': <A, B>(a: A, fb: ListBox<B>) => ListBox<A>
    '$>': <A, B>(fa: ListBox<A>, b: B) => ListBox<B>
    '<&>': <A, B>(fa: ListBox<A>, f: (a: A) => B) => ListBox<B>

    pure<A>(a:A): ListBox<A>
    lift<A, B>(fab: ListBox<Application<A, B>>, fa: ListBox<A>): ListBox<B>
    '<*>'<A, B>(fab: ListBox<Application<A, B>>, fa: ListBox<A>): ListBox<B>
    liftA<A, B>(f: Application<A, B>, fa: ListBox<A>): ListBox<B>
    liftA2<A, B, C, X extends Application2<A, B, C>>(
        abc: X, fa: ListBox<A>, fb: ListBox<B>): ListBox<C>
    liftA3<A, B, C, D>(
        f: Application3<A, B, C, D>,
        fa: ListBox<A>,
        fb: ListBox<B>,
        fc: ListBox<C>): ListBox<D>
    '*>'<A, B>(fa: ListBox<A>, fb: ListBox<B>): ListBox<B>
    '<*'<A, B>(fa: ListBox<A>, fb: ListBox<B>): ListBox<A>
    '<**>'<A, B>(fa: ListBox<A>, fab: ListBox<Application<A, B>>): ListBox<B>

    '>>='<A, B>(ma: ListBox<A>, action: Application<A, ListBox<B>>): ListBox<B>
    '>>'<A, B>(ma: ListBox<A>, mb: ListBox<B>): ListBox<B>
    return<A>(a: A) : ListBox<A>
    fail<A>(value: string): ListBox<A>
}

const implementation = {
    '>>='<A, B>(ma: ListBox<A>, action: Application<A, ListBox<B>>): ListBox<B> {
        ma = ma || List.empty()
        action = action || ((_) => List.empty())

        return ma.reduce((acc, curr) =>
            acc['++'](action(curr)),
            List.empty() as ListBox<B>
        )
    },

    fail<A>(_: string): ListBox<A> {
        return List.empty()
    },

    isOfType<A>(a:A) {
        return a instanceof List
    }
} as IMonadBase<IsList>

export const monad = monadBase(implementation, applicative) as IListMonad