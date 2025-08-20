import { Applicative } from 'ghc/base/applicative'
import { Traversable, traversable as createTraversable, BaseImplementation } from 'ghc/base/traversable'
import { functor } from './functor'
import { foldable } from './foldable'
import { ListBox, $null, head, tail, nil, cons } from './list'
import { MinBox1 } from 'data/kind'

export interface ListTraversable<T> extends Traversable {
    traverse<A, B>(app: Applicative, f: (a: A) => MinBox1<B>, ta: ListBox<A>): MinBox1<ListBox<B>>
    sequenceA<A>(app: Applicative, tfa: ListBox<MinBox1<A>>): MinBox1<ListBox<A>>
}

const sequenceA = <A>(app: Applicative, tfa: ListBox<MinBox1<A>>): MinBox1<ListBox<A>> => {
    if ($null(tfa)) {
        return app.pure(nil())
    }
    return app.liftA2((x: A) => (xs: ListBox<A>) => cons(x as NonNullable<A>)(xs), head(tfa), sequenceA(app, tail(tfa)))
}

const base: BaseImplementation = {
    sequenceA,
}

export const traversable = createTraversable(base, functor, foldable) as ListTraversable<unknown>
