import { alternative as createAlternative, Alternative, BaseImplementation } from 'control/alternative/alternative'
import { applicative } from './applicative'
import { $case, just, nothing, MaybeBox } from './maybe'
import { cons, nil, ListBox } from 'ghc/base/list/list'

export interface MaybeAlternative extends Alternative {
    empty<A>(): MaybeBox<A>
    '<|>'<A>(a: MaybeBox<A>, b: MaybeBox<A>): MaybeBox<A>
    some<A>(fa: MaybeBox<A>): MaybeBox<ListBox<A>>
    many<A>(fa: MaybeBox<A>): MaybeBox<ListBox<A>>
}

const base: BaseImplementation = {
    empty: nothing,
    '<|>': <A>(fa: MaybeBox<A>, fb: MaybeBox<A>): MaybeBox<A> =>
        $case<A, MaybeBox<A>>({
            just: () => fa,
            nothing: () => fb,
        })(fa),
}

const some = <A>(fa: MaybeBox<A>): MaybeBox<ListBox<A>> =>
    $case<A, MaybeBox<ListBox<A>>>({
        just: (x) => just(cons(x as NonNullable<A>)(nil())),
        nothing,
    })(fa)

const many = <A>(fa: MaybeBox<A>): MaybeBox<ListBox<A>> =>
    $case<A, MaybeBox<ListBox<A>>>({
        just: (x) => just(cons(x as NonNullable<A>)(nil())),
        nothing: () => just(nil()),
    })(fa)

export const alternative = (() => {
    const alt = createAlternative(base, applicative) as MaybeAlternative
    alt.some = some
    alt.many = many
    return alt
})()
