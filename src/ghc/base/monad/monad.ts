import { MinBox1 } from 'data/kind'
import { Applicative } from 'ghc/base/applicative'
import { FunctionArrow } from 'ghc/prim/function-arrow'

export type MonadBase = Applicative & {
    // Sequentially compose two actions, passing any value produced
    // by the first as an argument to the second.
    // (>>=) :: m a -> (a -> m b) -> m b
    '>>=': <A, B>(ma: MinBox1<A>, f: FunctionArrow<A, MinBox1<B>>) => MinBox1<B>
}

export type Monad = MonadBase & {
    // Sequentially compose two actions, discarding any value produced
    // by the first, like sequencing operators (such as the semicolon)
    // in imperative languages.
    //(>>) :: m a -> m b -> m b
    '>>': <A, B>(ma: MinBox1<A>, mb: MinBox1<B>) => MinBox1<B>

    // Inject a value into the monadic type.
    //return :: a -> m a
    return: <A>(a: NonNullable<A>) => MinBox1<A>
}

const extensions = (monadBase: MonadBase) => ({
    // m >> k = m >>= \_ -> k
    '>>': <A, B>(ma: MinBox1<A>, mb: MinBox1<B>): MinBox1<B> => monadBase['>>='](ma, (_) => mb),

    // return = pure
    return: monadBase.pure,
})

export const monad = (base: MonadBase, applicative: Applicative): Monad => {
    return {
        ...applicative,
        ...base,
        ...extensions(base),
    }
}
