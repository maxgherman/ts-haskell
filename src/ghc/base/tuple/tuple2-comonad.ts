import { comonad as createComonad, Comonad, BaseImplementation } from 'control/comonad'
import { Tuple2BoxT, tuple2, fst, snd } from './tuple'
import { functor as createFunctor } from './tuple2-functor'

export interface Tuple2Comonad<T> extends Comonad {
    extract<A>(wa: Tuple2BoxT<T, A>): A
    extend<A, B>(f: (wa: Tuple2BoxT<T, A>) => B, wa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>
    duplicate<A>(wa: Tuple2BoxT<T, A>): Tuple2BoxT<T, Tuple2BoxT<T, A>>

    fmap<A, B>(f: (a: A) => B, fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>
    '<$>'<A, B>(f: (a: A) => B, fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B>
    '<$'<A, B>(a: A, fb: Tuple2BoxT<T, B>): Tuple2BoxT<T, A>
    '$>'<A, B>(fa: Tuple2BoxT<T, A>, b: B): Tuple2BoxT<T, B>
    '<&>'<A, B>(fa: Tuple2BoxT<T, A>, f: (a: A) => B): Tuple2BoxT<T, B>
    void<A>(fa: Tuple2BoxT<T, A>): Tuple2BoxT<T, []>
}

const baseImplementation = <T>(): BaseImplementation => ({
    extract: <A>(wa: Tuple2BoxT<T, A>): A => snd(wa),
    duplicate: <A>(wa: Tuple2BoxT<T, A>): Tuple2BoxT<T, Tuple2BoxT<T, A>> => tuple2(fst(wa), wa),
    extend: <A, B>(f: (wa: Tuple2BoxT<T, A>) => B, wa: Tuple2BoxT<T, A>): Tuple2BoxT<T, B> => tuple2(fst(wa), f(wa)),
})

export const comonad = <T>(): Tuple2Comonad<T> => {
    const functor = createFunctor<T>()
    const base = baseImplementation<T>()
    return createComonad(base, functor) as Tuple2Comonad<T>
}
