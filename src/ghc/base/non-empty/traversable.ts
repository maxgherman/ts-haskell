import { Applicative } from 'ghc/base/applicative'
import { Traversable, traversable as createTraversable, BaseImplementation } from 'data/traversable'
import { functor } from './functor'
import { foldable } from './foldable'
import { NonEmptyBox, toList, formList } from './list'
import { traversable as listTraversable } from 'ghc/base/list/traversable'
import { MinBox1 } from 'data/kind'

export interface NonEmptyTraversable extends Traversable {
    traverse<A, B>(app: Applicative, f: (a: A) => MinBox1<B>, ta: NonEmptyBox<A>): MinBox1<NonEmptyBox<B>>
    sequenceA<A>(app: Applicative, tfa: NonEmptyBox<MinBox1<A>>): MinBox1<NonEmptyBox<A>>
}

const base: BaseImplementation = {
    sequenceA: <A>(app: Applicative, tfa: NonEmptyBox<MinBox1<A>>): MinBox1<NonEmptyBox<A>> =>
        app['<$>'](formList, listTraversable.sequenceA(app, toList(tfa))),
}

export const traversable = createTraversable(base, functor, foldable) as NonEmptyTraversable
