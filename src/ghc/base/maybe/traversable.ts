import { Applicative } from 'ghc/base/applicative'
import { Traversable, traversable as createTraversable, BaseImplementation } from 'data/traversable'
import { functor } from './functor'
import { foldable } from './foldable'
import { $case, just, nothing, MaybeBox } from './maybe'
import { MinBox1 } from 'data/kind'

export interface MaybeTraversable extends Traversable {
    traverse<A, B>(app: Applicative, f: (a: A) => MinBox1<B>, ta: MaybeBox<A>): MinBox1<MaybeBox<B>>
    sequenceA<A>(app: Applicative, tfa: MaybeBox<MinBox1<A>>): MinBox1<MaybeBox<A>>
}

const base: BaseImplementation = {
    sequenceA: <A>(app: Applicative, tfa: MaybeBox<MinBox1<A>>): MinBox1<MaybeBox<A>> =>
        $case<MinBox1<A>, MinBox1<MaybeBox<A>>>({
            nothing: () => app.pure(nothing()),
            just: (x) => app['<$>'](just as (a: A) => MaybeBox<A>, x),
        })(tfa),
}

export const traversable = createTraversable(base, functor, foldable) as MaybeTraversable
