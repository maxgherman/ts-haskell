import { MinBox1 } from 'data/kind'
import { Functor } from 'ghc/base/functor'

export type ComonadBase = Functor & {
    // extract :: w a -> a
    extract<A>(wa: MinBox1<A>): A

    // extend :: (w a -> b) -> w a -> w b
    extend?<A, B>(f: (wa: MinBox1<A>) => B, wa: MinBox1<A>): MinBox1<B>

    // duplicate :: w a -> w (w a)
    duplicate?<A>(wa: MinBox1<A>): MinBox1<MinBox1<A>>
}

export type Comonad = ComonadBase & {
    extend<A, B>(f: (wa: MinBox1<A>) => B, wa: MinBox1<A>): MinBox1<B>
    duplicate<A>(wa: MinBox1<A>): MinBox1<MinBox1<A>>
}

export type BaseImplementation = Pick<ComonadBase, 'extract'> &
    Partial<Pick<ComonadBase, 'extend' | 'duplicate'>> &
    (Pick<ComonadBase, 'extend'> | Pick<ComonadBase, 'duplicate'>)

export const comonad = (base: BaseImplementation, functor: Functor): Comonad => {
    const result: Comonad = { ...functor, ...base } as Comonad

    if (!result.extend && result.duplicate) {
        result.extend = <A, B>(f: (wa: MinBox1<A>) => B, wa: MinBox1<A>): MinBox1<B> =>
            functor.fmap(f, result.duplicate!(wa))
    }

    if (!result.duplicate && result.extend) {
        result.duplicate = <A>(wa: MinBox1<A>): MinBox1<MinBox1<A>> => result.extend!((w: MinBox1<A>) => w, wa)
    }

    return result
}
