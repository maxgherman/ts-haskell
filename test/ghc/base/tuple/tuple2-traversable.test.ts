import tap from 'tap'
import type { Test } from 'tap'
import { traversable } from 'ghc/base/tuple/tuple2-traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { tuple2, fst, snd, Tuple2Box } from 'ghc/base/tuple/tuple'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'

const caseMaybe = <A>(t: Test, mb: MaybeBox<A>, onJust: (a: A) => void) =>
    $case<A, void>({ nothing: () => t.fail('expected just'), just: onJust })(mb)

tap.test('Tuple2 traversable', async (t) => {
    t.test('sequenceA', async (t) => {
        const tfa = tuple2('x', just(5)) as Tuple2Box<string, MaybeBox<number>>
        const res = traversable<string>().sequenceA(maybeApplicative, tfa) as MaybeBox<Tuple2Box<string, number>>
        caseMaybe<Tuple2Box<string, number>>(t, res, (p) => {
            t.equal(fst(p), 'x')
            t.equal(snd(p), 5)
        })

        const tfa2 = tuple2('x', nothing<number>()) as Tuple2Box<string, MaybeBox<number>>
        const res2 = traversable<string>().sequenceA(maybeApplicative, tfa2) as MaybeBox<Tuple2Box<string, number>>
        $case<Tuple2Box<string, number>, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(res2)
    })

    t.test('traverse', async (t) => {
        const fa = tuple2('x', 5) as Tuple2Box<string, number>
        const res = traversable<string>().traverse(
            maybeApplicative,
            (x: number) => just(x + 1),
            fa,
        ) as MaybeBox<Tuple2Box<string, number>>
        caseMaybe<Tuple2Box<string, number>>(t, res, (p) => {
            t.equal(fst(p), 'x')
            t.equal(snd(p), 6)
        })

        const res2 = traversable<string>().traverse(
            maybeApplicative,
            (_: number) => nothing<number>(),
            fa,
        ) as MaybeBox<Tuple2Box<string, number>>
        $case<Tuple2Box<string, number>, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(res2)
    })
})
