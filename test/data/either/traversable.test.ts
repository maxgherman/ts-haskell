import tap from 'tap'
import type { Test } from 'tap'
import { traversable } from 'data/either/traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { left, right, $case as eitherCase, EitherBox } from 'data/either/either'
import { just, $case, MaybeBox } from 'ghc/base/maybe/maybe'

const caseMaybe = <A>(t: Test, mb: MaybeBox<A>, onJust: (a: A) => void) =>
    $case<A, void>({ nothing: () => t.fail('expected just'), just: onJust })(mb)

tap.test('Either traversable', async (t) => {
    t.test('sequenceA', async (t) => {
        const tfa = right<string, any>(just(7)) as EitherBox<string, any>
        const res = traversable<string>().sequenceA(maybeApplicative, tfa) as MaybeBox<EitherBox<string, number>>
        caseMaybe<EitherBox<string, number>>(t, res, (e) =>
            eitherCase<string, number, void>({
                left: () => t.fail('expected right'),
                right: (v) => t.equal(v, 7),
            })(e),
        )

        const tfa2 = left<string, any>('err') as EitherBox<string, any>
        const res2 = traversable<string>().sequenceA(maybeApplicative, tfa2) as MaybeBox<EitherBox<string, number>>
        caseMaybe<EitherBox<string, number>>(t, res2, (e) =>
            eitherCase<string, number, void>({
                left: (err) => t.equal(err, 'err'),
                right: () => t.fail('expected left'),
            })(e),
        )
    })
})
