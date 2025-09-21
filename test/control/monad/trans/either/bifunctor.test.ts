import tap from 'tap'
import { functor as maybeFunctor } from 'ghc/base/maybe/functor'
import { bifunctor as eitherTBifunctor } from 'control/monad/trans/either/bifunctor'
import { eitherT, runEitherT, EitherTBox } from 'control/monad/trans/either/either-t'
import { left, right, EitherBox, $case as eitherCase } from 'data/either/either'
import { MaybeBox, just, $case as maybeCase } from 'ghc/base/maybe/maybe'
import { MinBox1 } from 'data/kind'

const functor = maybeFunctor
const BiFunctor = eitherTBifunctor(functor)

const expectJust = <T>(value: MaybeBox<T>): T =>
    maybeCase<T, T>({
        just: (inner) => inner,
        nothing: () => {
            throw new Error('expected Just')
        },
    })(value)

const expectEither = <E, A>(value: EitherBox<E, A>) =>
    eitherCase<E, A, { tag: 'left'; value: E } | { tag: 'right'; value: A }>({
        left: (e) => ({ tag: 'left', value: e }),
        right: (a) => ({ tag: 'right', value: a }),
    })(value)

tap.test('EitherT Bifunctor maps both components through the base functor', (t) => {
    const source = eitherT<string, number>(
        () => just(right<string, number>(5)) as unknown as MinBox1<EitherBox<string, number>>,
    )

    const mapped = BiFunctor.bimap(
        (e: string) => e + '!',
        (n: number) => n * 2,
        source,
    ) as EitherTBox<string, number>

    const mappedEither = expectEither(expectJust(runEitherT(mapped) as MaybeBox<EitherBox<string, number>>))
    t.same(mappedEither, { tag: 'right', value: 10 })

    const leftSource = eitherT<string, number>(
        () => just(left<string, number>('err')) as unknown as MinBox1<EitherBox<string, number>>,
    )

    const mappedLeft = BiFunctor.first((e: string) => e.toUpperCase(), leftSource) as EitherTBox<string, number>
    const leftValue = expectEither(expectJust(runEitherT(mappedLeft) as MaybeBox<EitherBox<string, number>>))
    t.same(leftValue, { tag: 'left', value: 'ERR' })

    const mappedRight = BiFunctor.second((n: number) => n + 1, source) as EitherTBox<string, number>
    const rightValue = expectEither(expectJust(runEitherT(mappedRight) as MaybeBox<EitherBox<string, number>>))
    t.same(rightValue, { tag: 'right', value: 6 })

    t.end()
})
