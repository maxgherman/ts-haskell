import { $case, EitherBox, left, right } from './either'
import { FMap, Functor, functor as createFunctor } from 'ghc/base/functor'

export interface EitherFunctor<T> extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: EitherBox<T, A>): EitherBox<T, B>

    '<$>'<A, B>(f: (a: A) => B, fa: EitherBox<T, A>): EitherBox<T, B>

    '<$'<A, B>(a: A, fb: EitherBox<T, B>): EitherBox<T, A>

    '$>'<A, B>(fa: EitherBox<T, A>, b: B): EitherBox<T, A>

    '<&>'<A, B>(fa: EitherBox<T, A>, f: (a: A) => B): EitherBox<T, B>

    void<A>(fa: EitherBox<T, A>): EitherBox<T, []>
}

const fmap = <T>(): FMap => ({
    // fmap :: EitherBox f => (a -> b) ->  f a -> f b
    fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: EitherBox<T, A>) => {
        return $case({
            left: (x) => left(x as unknown),
            right: (x: A) => right(f(x)),
        })(fa) as EitherBox<T, B>
    },
})

export const functor = <T>() => createFunctor(fmap<T>()) as EitherFunctor<T>
