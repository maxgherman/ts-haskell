import { comonadApply as createComonadApply, ComonadApply, BaseImplementation } from 'control/comonad-apply'
import { NonEmptyBox, head, tail, cons } from './list'
import { comonad } from './comonad'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { ListBox, cons as listCons, head as listHead, tail as listTail, $null, nil } from 'ghc/base/list/list'

export interface NonEmptyComonadApply extends ComonadApply {
    '<@>'<A, B>(f: NonEmptyBox<FunctionArrow<A, B>>, wa: NonEmptyBox<A>): NonEmptyBox<B>
    liftW2<A, B, C>(f: FunctionArrow2<A, B, C>, wa: NonEmptyBox<A>, wb: NonEmptyBox<B>): NonEmptyBox<C>

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

const zipWith = <A, B, C>(f: (a: A, b: B) => NonNullable<C>, la: ListBox<A>, lb: ListBox<B>): ListBox<C> => {
    if ($null(la) || $null(lb)) {
        return nil()
    }
    return listCons(f(listHead(la), listHead(lb)))(zipWith(f, listTail(la), listTail(lb)))
}

const baseImplementation: BaseImplementation = {
    '<@>': <A, B>(wf: NonEmptyBox<FunctionArrow<A, B>>, wa: NonEmptyBox<A>): NonEmptyBox<B> => {
        const headResult = head(wf)(head(wa)) as NonNullable<B>
        const tailResult = zipWith((f, a) => f(a) as NonNullable<B>, tail(wf), tail(wa))
        return cons(headResult)(tailResult)
    },
}

export const comonadApply = createComonadApply(baseImplementation, comonad) as NonEmptyComonadApply
