import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative as createApplicative } from './applicative'
import { writer, WriterBox } from './writer'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import type { Monoid } from 'ghc/base/monoid'
import { tuple2 } from 'ghc/base/tuple/tuple'
import { MinBox0 } from 'data/kind'

export interface WriterMonad<W> extends Monad {
    '>>='<A, B>(ma: WriterBox<W, A>, f: FunctionArrow<A, WriterBox<W, B>>): WriterBox<W, B>

    '>>'<A, B>(ma: WriterBox<W, A>, mb: WriterBox<W, B>): WriterBox<W, B>

    return<A>(a: NonNullable<A>): WriterBox<W, A>

    pure<A>(a: NonNullable<A>): WriterBox<W, A>

    '<*>'<A, B>(f: WriterBox<W, FunctionArrow<A, B>>, fa: WriterBox<W, A>): WriterBox<W, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: WriterBox<W, A>, fb: WriterBox<W, B>): WriterBox<W, C>

    '*>'<A, B>(fa: WriterBox<W, A>, fb: WriterBox<W, B>): WriterBox<W, B>

    '<*'<A, B>(fa: WriterBox<W, A>, fb: WriterBox<W, B>): WriterBox<W, A>

    '<**>'<A, B>(fa: WriterBox<W, A>, f: WriterBox<W, FunctionArrow<A, B>>): WriterBox<W, B>

    fmap<A, B>(f: (a: A) => B, fa: WriterBox<W, A>): WriterBox<W, B>

    '<$>'<A, B>(f: (a: A) => B, fa: WriterBox<W, A>): WriterBox<W, B>

    '<$'<A, B>(a: A, fb: WriterBox<W, B>): WriterBox<W, A>

    '$>'<A, B>(fa: WriterBox<W, A>, b: B): WriterBox<W, B>

    '<&>'<A, B>(fa: WriterBox<W, A>, f: (a: A) => B): WriterBox<W, B>

    void<A>(fa: WriterBox<W, A>): WriterBox<W, []>
}

const baseImplementation = <W>(wMonoid: Monoid<W>) => ({
    '>>=': <A, B>(ma: WriterBox<W, A>, f: FunctionArrow<A, WriterBox<W, B>>): WriterBox<W, B> =>
        writer(() => {
            const [a, w1] = ma.runWriter()
            const [b, w2] = f(a).runWriter()
            return tuple2(b, wMonoid['<>'](w1 as MinBox0<W>, w2 as MinBox0<W>) as W)
        }),
})

export const monad = <W>(wMonoid: Monoid<W>): WriterMonad<W> => {
    const base = baseImplementation<W>(wMonoid)
    const applicative = createApplicative<W>(wMonoid)
    return createMonad(base, applicative) as WriterMonad<W>
}
