import tap from 'tap'
import { traversable } from 'ghc/base/tuple/tuple2-traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { tuple2, fst, snd, Tuple2Box } from 'ghc/base/tuple/tuple'
import { just, nothing, $case } from 'ghc/base/maybe/maybe'

const caseMaybe = <A>(t: tap.Test, mb: any, onJust: (a: A) => void) =>
    $case<A, void>({ nothing: () => t.fail('expected just'), just: onJust })(mb)

tap.test('Tuple2 traversable', async (t) => {
    t.test('sequenceA', async (t) => {
        const tfa = tuple2('x', just(5)) as Tuple2Box<string, any>
        const res = traversable<string>().sequenceA(maybeApplicative, tfa)
        caseMaybe(t, res, (p) => {
            t.equal(fst(p), 'x')
            t.equal(snd(p), 5)
        })

        const tfa2 = tuple2('x', nothing()) as Tuple2Box<string, any>
        const res2 = traversable<string>().sequenceA(maybeApplicative, tfa2)
        $case<Tuple2Box<string, number>, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(res2)
    })
})
