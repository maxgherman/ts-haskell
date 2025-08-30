import tap from 'tap'
import type { Test } from 'tap'
import { traversable } from 'data/either/traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { left, right, $case as eitherCase, EitherBox } from 'data/either/either'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'

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

    t.test('traverse', async (t) => {
        const fa = right<string, number>(3) as EitherBox<string, number>
        const res = traversable<string>().traverse(maybeApplicative, (x: number) => just(x + 1), fa) as MaybeBox<
            EitherBox<string, number>
        >
        caseMaybe<EitherBox<string, number>>(t, res, (e) =>
            eitherCase<string, number, void>({
                left: () => t.fail('expected right'),
                right: (v) => t.equal(v, 4),
            })(e),
        )

        const leftVal = left<string, number>('err') as EitherBox<string, number>
        const res2 = traversable<string>().traverse(maybeApplicative, (x: number) => just(x + 1), leftVal) as MaybeBox<
            EitherBox<string, number>
        >
        caseMaybe<EitherBox<string, number>>(t, res2, (e) =>
            eitherCase<string, number, void>({
                left: (err) => t.equal(err, 'err'),
                right: () => t.fail('expected left'),
            })(e),
        )

        const res3 = traversable<string>().traverse(maybeApplicative, (_: number) => nothing<number>(), fa) as MaybeBox<
            EitherBox<string, number>
        >
        $case<EitherBox<string, number>, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(res3)
    })

    t.test('mapM', async (t) => {
        const fa = right<string, number>(3) as EitherBox<string, number>
        const res = traversable<string>().mapM(maybeMonad, (x: number) => just(x + 1), fa) as MaybeBox<
            EitherBox<string, number>
        >
        caseMaybe<EitherBox<string, number>>(t, res, (e) =>
            eitherCase<string, number, void>({
                left: () => t.fail('expected right'),
                right: (v) => t.equal(v, 4),
            })(e),
        )

        const leftVal = left<string, number>('err') as EitherBox<string, number>
        const res2 = traversable<string>().mapM(maybeMonad, (x: number) => just(x + 1), leftVal) as MaybeBox<
            EitherBox<string, number>
        >
        caseMaybe<EitherBox<string, number>>(t, res2, (e) =>
            eitherCase<string, number, void>({
                left: (err) => t.equal(err, 'err'),
                right: () => t.fail('expected left'),
            })(e),
        )

        const res3 = traversable<string>().mapM(maybeMonad, (_: number) => nothing<number>(), fa) as MaybeBox<
            EitherBox<string, number>
        >
        $case<EitherBox<string, number>, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(res3)
    })

    t.test('sequence', async (t) => {
        const tfa = right<string, any>(just(7)) as EitherBox<string, any>
        const res = traversable<string>().sequence(maybeMonad, tfa) as MaybeBox<EitherBox<string, number>>
        caseMaybe<EitherBox<string, number>>(t, res, (e) =>
            eitherCase<string, number, void>({
                left: () => t.fail('expected right'),
                right: (v) => t.equal(v, 7),
            })(e),
        )

        const tfa2 = left<string, any>('err') as EitherBox<string, any>
        const res2 = traversable<string>().sequence(maybeMonad, tfa2) as MaybeBox<EitherBox<string, number>>
        caseMaybe<EitherBox<string, number>>(t, res2, (e) =>
            eitherCase<string, number, void>({
                left: (err) => t.equal(err, 'err'),
                right: () => t.fail('expected left'),
            })(e),
        )

        const tfa3 = right<string, any>(nothing<number>()) as EitherBox<string, any>
        const res3 = traversable<string>().sequence(maybeMonad, tfa3) as MaybeBox<EitherBox<string, number>>
        $case<EitherBox<string, number>, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(res3)
    })
})
