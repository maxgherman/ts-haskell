import { $case, EitherBox } from './either'
import { BiFoldable, bifoldable as createBiFoldable, BiFoldableBase } from 'data/bifoldable'
import { Monoid } from 'ghc/base/monoid'
import { MinBox0 } from 'data/kind'

export interface EitherBiFoldable extends BiFoldable {
    bifoldMap<A, B, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, g: (b: B) => MinBox0<M>, fab: EitherBox<A, B>): MinBox0<M>
}

const base: BiFoldableBase = {
    bifoldMap: <A, B, M>(m: Monoid<M>, f: (a: A) => MinBox0<M>, g: (b: B) => MinBox0<M>, fab: EitherBox<A, B>) =>
        $case<A, B, MinBox0<M>>({
            left: (a: A) => f(a),
            right: (b: B) => g(b),
        })(fab),
}

export const bifoldable = () => createBiFoldable(base) as EitherBiFoldable
