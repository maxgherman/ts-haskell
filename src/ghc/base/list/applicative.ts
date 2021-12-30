import { applicative as createApplicative, Applicative, BaseImplementation } from 'ghc/base/applicative'
import { ListBox, cons, nil } from 'ghc/base/list/list'
import { functor } from 'ghc/base/list/functor'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface ListApplicative extends Applicative {
    pure<A>(a: A): ListBox<A>

    '<*>'<A, B>(f: ListBox<FunctionArrow<A, B>>, fa: ListBox<A>): ListBox<B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: ListBox<A>, fb: ListBox<B>): ListBox<C>

    '*>'<A, B>(fa: ListBox<A>, fb: ListBox<B>): ListBox<B>

    '<*'<A, B>(fa: ListBox<A>, fb: ListBox<B>): ListBox<A>

    '<**>'<A, B>(fa: ListBox<A>, f: ListBox<FunctionArrow<A, B>>): ListBox<B>

    fmap<A, B>(f: (a: A) => B, fa: ListBox<A>): ListBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: ListBox<A>): ListBox<B>

    '<$'<A, B>(a: A, fb: ListBox<B>): ListBox<A>

    '$>'<A, B>(fa: ListBox<A>, b: B): ListBox<B>

    '<&>'<A, B>(fa: ListBox<A>, f: (a: A) => B): ListBox<B>

    void<A>(fa: ListBox<A>): ListBox<[]>
}

// const baseImplementation: BaseImplementation = {
//     // pure x = [x]
//     pure: <A>(a: NonNullable<A>): ListBox<A> => cons(a)(nil()),

//     // fs <*> xs = [f x | f <- fs, x <- xs]
//     '<*>': <A, B>(f: ListBox<FunctionArrow<A, B>>, fa: ListBox<A>): ListBox<B> => {},
// }
