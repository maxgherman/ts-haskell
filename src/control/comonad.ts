import { MinBox1 } from 'data/kind'
import { Functor } from 'ghc/base/functor'

export type ComonadBase = Functor & {
    // extract :: w a -> a
    extract<A>(wa: MinBox1<A>): A

    // extend :: (w a -> b) -> w a -> w b
    extend?<A, B>(f: (wa: MinBox1<A>) => B, wa: MinBox1<A>): MinBox1<B>

    // duplicate :: w a -> w (w a)
    duplicate?<A>(wa: MinBox1<A>): MinBox1<MinBox1<A>>

    // liftW :: Comonad w => (a -> b) -> w a -> w b
    liftW<A, B>(f: (a: A) => B, wa: MinBox1<A>): MinBox1<B>

    // wfix :: Comonad w => w (w a -> a) -> a
    wfix<A>(w: MinBox1<(wa: MinBox1<A>) => A>): A

    // cfix :: Comonad w => (w a -> a) -> w a
    cfix<A>(f: (wa: MinBox1<A>) => A): MinBox1<A>

    // '=>>' :: Comonad w => w a -> (w a -> b) -> w b
    '=>>'<A, B>(wa: MinBox1<A>, f: (wa: MinBox1<A>) => B): MinBox1<B>

    // '<<=' :: Comonad w => (w a -> b) -> w a -> w b
    '<<='<A, B>(f: (wa: MinBox1<A>) => B, wa: MinBox1<A>): MinBox1<B>

    // '=<=' :: Comonad w => (w b -> c) -> (w a -> b) -> w a -> c
    '=<='<A, B, C>(f: (wb: MinBox1<B>) => C, g: (wa: MinBox1<A>) => B, wa: MinBox1<A>): C

    // '=>=' :: Comonad w => (w a -> b) -> (w b -> c) -> w a -> c
    '=>='<A, B, C>(f: (wa: MinBox1<A>) => B, g: (wb: MinBox1<B>) => C, wa: MinBox1<A>): C
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

    result.liftW = <A, B>(f: (a: A) => B, wa: MinBox1<A>): MinBox1<B> =>
        result.extend((w: MinBox1<A>) => f(result.extract(w)), wa)

    const wfix = <A>(w: MinBox1<(wa: MinBox1<A>) => A>): A => result.extract(w)(result.extend(wfix, w))
    result.wfix = wfix

    result.cfix = <A>(f: (wa: MinBox1<A>) => A): MinBox1<A> => {
        let wa!: MinBox1<A>
        // eslint-disable-next-line prefer-const
        wa = result.extend(f, wa as MinBox1<A>)
        return wa
    }

    result['=>>'] = <A, B>(wa: MinBox1<A>, f: (wa: MinBox1<A>) => B): MinBox1<B> => result.extend(f, wa)

    result['<<='] = <A, B>(f: (wa: MinBox1<A>) => B, wa: MinBox1<A>): MinBox1<B> => result.extend(f, wa)

    result['=<='] = <A, B, C>(f: (wb: MinBox1<B>) => C, g: (wa: MinBox1<A>) => B, wa: MinBox1<A>): C =>
        f(result.extend(g, wa))

    result['=>='] = <A, B, C>(f: (wa: MinBox1<A>) => B, g: (wb: MinBox1<B>) => C, wa: MinBox1<A>): C =>
        g(result.extend(f, wa))

    return result
}
