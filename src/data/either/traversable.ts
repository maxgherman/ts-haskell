import { Applicative } from 'ghc/base/applicative'
import { Traversable, traversable as createTraversable, BaseImplementation } from 'data/traversable'
import { functor } from './functor'
import { foldable } from './foldable'
import { $case, left, right, EitherBox } from './either'
import { MinBox1 } from 'data/kind'

export interface EitherTraversable<E> extends Traversable {
    traverse<A, B>(app: Applicative, f: (a: A) => MinBox1<B>, ta: EitherBox<E, A>): MinBox1<EitherBox<E, B>>
    sequenceA<A>(app: Applicative, tfa: EitherBox<E, MinBox1<A>>): MinBox1<EitherBox<E, A>>
}

const base = <E>(): BaseImplementation => ({
    sequenceA: <A>(app: Applicative, tfa: EitherBox<E, MinBox1<A>>): MinBox1<EitherBox<E, A>> =>
        $case<E, MinBox1<A>, MinBox1<EitherBox<E, A>>>({
            left: (e) => app.pure(left<E, A>(e as NonNullable<E>)),
            right: (m) => app['<$>'](right as (a: A) => EitherBox<E, A>, m),
        })(tfa),
})

export const traversable = <E>() => createTraversable(base<E>(), functor<E>(), foldable<E>()) as EitherTraversable<E>
