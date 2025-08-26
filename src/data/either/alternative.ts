// instance (Monoid e) => Alternative (Either e) -- Defined in 'Data.Either'

import { alternative as createAlternative, Alternative, BaseImplementation } from 'control/alternative/alternative'
import { applicative } from './applicative'
import { $case, left, right, EitherBox } from './either'
import { Monoid } from 'ghc/base/monoid'
import { MinBox0 } from 'data/kind'
import { cons, nil, ListBox } from 'ghc/base/list/list'

export interface EitherAlternative<T> extends Alternative {
    empty<A>(): EitherBox<T, A>
    '<|>'<A>(a: EitherBox<T, A>, b: EitherBox<T, A>): EitherBox<T, A>
    some<A>(fa: EitherBox<T, A>): EitherBox<T, ListBox<A>>
    many<A>(fa: EitherBox<T, A>): EitherBox<T, ListBox<A>>
}

const base = <T>(monoid: Monoid<T>): BaseImplementation => ({
    empty: <A>() => left<T, A>(monoid.mempty as unknown as NonNullable<T>),
    '<|>': <A>(fa: EitherBox<T, A>, fb: EitherBox<T, A>): EitherBox<T, A> =>
        $case<T, A, EitherBox<T, A>>({
            right: () => fa,
            left: (e1: T) =>
                $case<T, A, EitherBox<T, A>>({
                    left: (e2: T) =>
                        left<T, A>(
                            monoid['<>'](
                                e1 as unknown as MinBox0<T>,
                                e2 as unknown as MinBox0<T>,
                            ) as unknown as NonNullable<T>,
                        ),
                    right: (b: A) => right<T, A>(b as NonNullable<A>),
                })(fb),
        })(fa),
})

const some = <T, A>(fa: EitherBox<T, A>): EitherBox<T, ListBox<A>> =>
    $case<T, A, EitherBox<T, ListBox<A>>>({
        left: (e) => left<T, ListBox<A>>(e as NonNullable<T>),
        right: (a) => right<T, ListBox<A>>(cons(a as NonNullable<A>)(nil<A>())),
    })(fa)

const many = <T, A>(fa: EitherBox<T, A>): EitherBox<T, ListBox<A>> =>
    $case<T, A, EitherBox<T, ListBox<A>>>({
        left: () => right<T, ListBox<A>>(nil<A>()),
        right: (a) => right<T, ListBox<A>>(cons(a as NonNullable<A>)(nil<A>())),
    })(fa)

export const alternative = <T>(monoid: Monoid<T>): EitherAlternative<T> => {
    const alt = createAlternative(base<T>(monoid), applicative<T>()) as EitherAlternative<T>
    alt.some = some as <A>(fa: EitherBox<T, A>) => EitherBox<T, ListBox<A>>
    alt.many = many as <A>(fa: EitherBox<T, A>) => EitherBox<T, ListBox<A>>
    return alt
}
