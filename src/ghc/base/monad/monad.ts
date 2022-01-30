import { MinBox1 } from 'data/kind'
import { Applicative } from 'ghc/base/applicative'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { doNotation } from './do-notation'

export type MonadBase = {
    // Sequentially compose two actions, passing any value produced
    // by the first as an argument to the second.
    // (>>=) :: m a -> (a -> m b) -> m b
    '>>='<A, B>(ma: MinBox1<A>, f: FunctionArrow<A, MinBox1<B>>): MinBox1<B>
}

export type Monad = Applicative &
    MonadBase & {
        // Sequentially compose two actions, discarding any value produced
        // by the first, like sequencing operators (such as the semicolon)
        // in imperative languages.
        //(>>) :: m a -> m b -> m b
        '>>'<A, B>(ma: MinBox1<A>, mb: MinBox1<B>): MinBox1<B>

        // Inject a value into the monadic type.
        //return :: a -> m a
        return<A>(a: NonNullable<A>): MinBox1<A>
    }

const extensions = (applicative: Applicative, monadBase: MonadBase) => ({
    // m >> k = m >>= \_ -> k
    '>>': <A, B>(ma: MinBox1<A>, mb: MinBox1<B>): MinBox1<B> => monadBase['>>='](ma, (_) => mb),

    // return = pure
    return: applicative.pure,
})

export const monad = (base: MonadBase, applicative: Applicative): Monad => {
    return {
        ...applicative,
        ...base,
        ...extensions(applicative, base),
    }
}

// ap :: (Monad m) => m (a -> b) -> m a -> m b
// do { x1 <- m1; x2 <- m2; return (x1 x2) }
export const ap = <A, B>(m: Monad, mab: MinBox1<FunctionArrow<A, B>>, ma: MinBox1<A>): MinBox1<B> => {
    return doNotation(function* () {
        const x1 = (yield mab) as FunctionArrow<A, B>
        const x2 = (yield ma) as A
        return x1(x2)
    }, m) as MinBox1<B>
}

// liftM2 :: (Monad m) => (a1 -> a2 -> r) -> m a1 -> m a2 -> m r
// do { x1 <- m1; x2 <- m2; return (f x1 x2) }
export const liftM2 = <A1, A2, R>(
    m: Monad,
    f: FunctionArrow2<A1, A2, R>,
    ma1: MinBox1<A1>,
    ma2: MinBox1<A2>,
): MinBox1<R> => {
    return doNotation(function* () {
        const x1 = (yield ma1) as A1
        const x2 = (yield ma2) as A2
        return f(x1)(x2)
    }, m) as MinBox1<R>
}
