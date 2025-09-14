import { Monad, monad as createMonad } from 'ghc/base/monad/monad'
import type { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'
import { Monoid } from 'ghc/base/monoid'
import { WriterTBox, writerT } from './writer-t'
import { applicative as createApplicative } from './applicative'
import { tuple2 } from 'ghc/base/tuple/tuple'
import type { MinBox0 } from 'data/kind'

export interface WriterTMonad<W> extends Monad {
    '>>='<A, B>(ma: WriterTBox<W, A>, f: FunctionArrow<A, WriterTBox<W, B>>): WriterTBox<W, B>

    '>>'<A, B>(ma: WriterTBox<W, A>, mb: WriterTBox<W, B>): WriterTBox<W, B>

    return<A>(a: NonNullable<A>): WriterTBox<W, A>

    pure<A>(a: NonNullable<A>): WriterTBox<W, A>

    '<*>'<A, B>(f: WriterTBox<W, FunctionArrow<A, B>>, fa: WriterTBox<W, A>): WriterTBox<W, B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: WriterTBox<W, A>, fb: WriterTBox<W, B>): WriterTBox<W, C>

    '*>'<A, B>(fa: WriterTBox<W, A>, fb: WriterTBox<W, B>): WriterTBox<W, B>

    '<*'<A, B>(fa: WriterTBox<W, A>, fb: WriterTBox<W, B>): WriterTBox<W, A>

    '<**>'<A, B>(fa: WriterTBox<W, A>, f: WriterTBox<W, FunctionArrow<A, B>>): WriterTBox<W, B>

    fmap<A, B>(f: (a: A) => B, fa: WriterTBox<W, A>): WriterTBox<W, B>

    '<$>'<A, B>(f: (a: A) => B, fa: WriterTBox<W, A>): WriterTBox<W, B>

    '<$'<A, B>(a: A, fb: WriterTBox<W, B>): WriterTBox<W, A>

    '$>'<A, B>(fa: WriterTBox<W, A>, b: B): WriterTBox<W, B>

    '<&>'<A, B>(fa: WriterTBox<W, A>, f: (a: A) => B): WriterTBox<W, B>

    void<A>(fa: WriterTBox<W, A>): WriterTBox<W, []>
}

const baseImplementation = <W>(m: Monad, wMonoid: Monoid<W>) => ({
    '>>=': <A, B>(ma: WriterTBox<W, A>, f: FunctionArrow<A, WriterTBox<W, B>>): WriterTBox<W, B> =>
        writerT(() =>
            m['>>='](ma.runWriterT(), ([a, w1]: [A, W]) =>
                m['>>='](f(a).runWriterT(), ([b, w2]: [B, W]) =>
                    m.return(
                        tuple2(
                            b,
                            wMonoid['<>'](w1 as unknown as MinBox0<W>, w2 as unknown as MinBox0<W>) as unknown as W,
                        ),
                    ),
                ),
            ),
        ),
})

export const monad = <W>(m: Monad, wMonoid: Monoid<W>): WriterTMonad<W> => {
    const base = baseImplementation<W>(m, wMonoid)
    const applicative = createApplicative<W>(m, wMonoid)
    return createMonad(base, applicative) as WriterTMonad<W>
}
