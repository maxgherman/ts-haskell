import tap from 'tap'
import type { Test } from 'tap'
import { traversable } from 'control/writer/traversable'
import { writer } from 'control/writer/writer'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import type { WriterBox } from 'control/writer/writer'
import { Tuple2Box, tuple2 } from 'ghc/base/tuple/tuple'

const caseMaybe = <A>(t: Test, mb: MaybeBox<A>, onJust: (a: A) => void) =>
    $case<A, void>({ nothing: () => t.fail('expected just'), just: onJust })(mb)

tap.test('Writer traversable', async (t) => {
    t.test('traverse', async (t) => {
        const w = writer((): Tuple2Box<number, string> => tuple2(3, 'log'))
        const res = traversable<string>().traverse(maybeApplicative, (x: number) => just(x + 1), w) as MaybeBox<
            WriterBox<string, number>
        >
        caseMaybe(t, res, (ww) => t.same(ww.runWriter(), [4, 'log']))

        const res2 = traversable<string>().traverse(maybeApplicative, (_: number) => nothing<number>(), w)
        $case<WriterBox<string, number>, void>({ nothing: () => t.pass(''), just: () => t.fail('expected nothing') })(
            res2 as MaybeBox<WriterBox<string, number>>,
        )
    })

    t.test('mapM', async (t) => {
        const w = writer((): Tuple2Box<number, string> => tuple2(3, 'log'))
        const res = traversable<string>().mapM(maybeMonad, (x: number) => just(x + 1), w) as MaybeBox<
            WriterBox<string, number>
        >
        caseMaybe(t, res, (ww) => t.same(ww.runWriter(), [4, 'log']))

        const res2 = traversable<string>().mapM(maybeMonad, (_: number) => nothing<number>(), w)
        $case<WriterBox<string, number>, void>({ nothing: () => t.pass(''), just: () => t.fail('expected nothing') })(
            res2 as MaybeBox<WriterBox<string, number>>,
        )
    })

    t.test('sequenceA', async (t) => {
        const w = writer((): Tuple2Box<MaybeBox<number>, string> => tuple2(just(3), 'log'))
        const res = traversable<string>().sequenceA(maybeApplicative, w) as MaybeBox<WriterBox<string, number>>
        caseMaybe(t, res, (ww) => t.same(ww.runWriter(), [3, 'log']))
    })

    t.test('sequence', async (t) => {
        const w = writer((): Tuple2Box<MaybeBox<number>, string> => tuple2(just(3), 'log'))
        const res = traversable<string>().sequence(maybeMonad, w) as MaybeBox<WriterBox<string, number>>
        caseMaybe(t, res, (ww) => t.same(ww.runWriter(), [3, 'log']))
    })
})
