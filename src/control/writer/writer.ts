import { Box2, MinBox0, Type } from 'data/kind'
import { Tuple2Box } from 'ghc/base/tuple/tuple'

export interface Writer<W, A> {
    readonly runWriter: () => Tuple2Box<A, W>
}

export type WriterBox<W, A> = Writer<W, A> & Box2<W, A>

export type WriterMinBox<W, A> = Writer<W, MinBox0<A>> & Box2<W, MinBox0<A>>

export const writer = <W, A>(fn: () => Tuple2Box<A, W>): WriterBox<W, A> => ({
    runWriter: fn,
    kind: (_: '*') => (_: '*') => '*' as Type,
})

export const runWriter = <W, A>(wa: Writer<W, A>): Tuple2Box<A, W> => wa.runWriter()

export const execWriter = <W, A>(wa: Writer<W, A>): W => wa.runWriter()[1]

export const mapWriter = <W, A, WPrime, B>(
    f: (aw: Tuple2Box<A, W>) => Tuple2Box<B, WPrime>,
    wa: WriterBox<W, A>,
): WriterBox<WPrime, B> => writer(() => f(wa.runWriter()))
