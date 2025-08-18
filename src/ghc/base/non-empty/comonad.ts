import { comonad as createComonad, Comonad, BaseImplementation } from 'control/comonad'
import { NonEmptyBox, head, tail, cons, map } from './list'
import { functor } from './functor'
import { ListBox, cons as listCons, head as listHead, tail as listTail, $null, nil } from 'ghc/base/list/list'

export interface NonEmptyComonad extends Comonad {
    extract<A>(wa: NonEmptyBox<A>): A
    extend<A, B>(f: (wa: NonEmptyBox<A>) => NonNullable<B>, wa: NonEmptyBox<A>): NonEmptyBox<B>
    duplicate<A>(wa: NonEmptyBox<A>): NonEmptyBox<NonEmptyBox<A>>

    fmap<A, B>(f: (a: A) => B, fa: NonEmptyBox<A>): NonEmptyBox<B>
    '<$>'<A, B>(f: (a: A) => B, fa: NonEmptyBox<A>): NonEmptyBox<B>
    '<$'<A, B>(a: A, fb: NonEmptyBox<B>): NonEmptyBox<A>
    '$>'<A, B>(fa: NonEmptyBox<A>, b: B): NonEmptyBox<B>
    '<&>'<A, B>(fa: NonEmptyBox<A>, f: (a: A) => B): NonEmptyBox<B>
    void<A>(fa: NonEmptyBox<A>): NonEmptyBox<[]>
}

const duplicate = <A>(wa: NonEmptyBox<A>): NonEmptyBox<NonEmptyBox<A>> => {
    const go = (lst: ListBox<A>): ListBox<NonEmptyBox<A>> => {
        if ($null(lst)) {
            return nil()
        }
        const ne = cons(listHead(lst) as NonNullable<A>)(listTail(lst))
        return listCons(ne)(go(listTail(lst)))
    }
    return cons(wa as NonNullable<NonEmptyBox<A>>)(go(tail(wa)))
}

const baseImplementation: BaseImplementation = {
    extract: <A>(wa: NonEmptyBox<A>): A => head(wa),
    duplicate,
    extend: <A, B>(f: (wa: NonEmptyBox<A>) => NonNullable<B>, wa: NonEmptyBox<A>): NonEmptyBox<B> =>
        map(f, duplicate(wa)),
}

export const comonad = createComonad(baseImplementation, functor) as NonEmptyComonad
