import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative as createApplicative } from './applicative'
import { state, StateBox } from './state'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface StateMonad<S> extends Monad {
    '>>='<A, B>(ma: StateBox<S, A>, f: FunctionArrow<A, StateBox<S, B>>): StateBox<S, B>

    '>>'<A, B>(ma: StateBox<S, A>, mb: StateBox<S, B>): StateBox<S, B>

    return<A>(a: NonNullable<A>): StateBox<S, A>

    pure<A>(a: NonNullable<A>): StateBox<S, A>

    '<*>'<A, B>(f: StateBox<S, FunctionArrow<A, B>>, fa: StateBox<S, A>): StateBox<S, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: StateBox<S, A>, fb: StateBox<S, B>): StateBox<S, C>

    '*>'<A, B>(fa: StateBox<S, A>, fb: StateBox<S, B>): StateBox<S, B>

    '<*'<A, B>(fa: StateBox<S, A>, fb: StateBox<S, B>): StateBox<S, A>

    '<**>'<A, B>(fa: StateBox<S, A>, f: StateBox<S, FunctionArrow<A, B>>): StateBox<S, B>

    fmap<A, B>(f: (a: A) => B, fa: StateBox<S, A>): StateBox<S, B>

    '<$>'<A, B>(f: (a: A) => B, fa: StateBox<S, A>): StateBox<S, B>

    '<$'<A, B>(a: A, fb: StateBox<S, B>): StateBox<S, A>

    '$>'<A, B>(fa: StateBox<S, A>, b: B): StateBox<S, B>

    '<&>'<A, B>(fa: StateBox<S, A>, f: (a: A) => B): StateBox<S, B>

    void<A>(fa: StateBox<S, A>): StateBox<S, []>
}

const baseImplementation = <S>() => ({
    '>>=': <A, B>(ma: StateBox<S, A>, f: FunctionArrow<A, StateBox<S, B>>): StateBox<S, B> =>
        state((s: S) => {
            const [a, s1] = ma.runState(s)
            return f(a).runState(s1)
        }),
})

export const monad = <S>(): StateMonad<S> => {
    const base = baseImplementation<S>()
    const applicative = createApplicative<S>()
    return createMonad(base, applicative) as StateMonad<S>
}
