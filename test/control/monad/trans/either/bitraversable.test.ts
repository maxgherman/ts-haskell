import tap from 'tap'
import { functor as maybeFunctor } from 'ghc/base/maybe/functor'
import { foldable as maybeFoldable } from 'ghc/base/maybe/foldable'
import { traversable as maybeTraversable } from 'ghc/base/maybe/traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { bitraversable as eitherTBiTraversable } from 'control/monad/trans/either/bitraversable'
import { eitherT, runEitherT, EitherTBox } from 'control/monad/trans/either/either-t'
import { left, right, EitherBox, $case as eitherCase } from 'data/either/either'
import { MaybeBox, just, nothing, $case as maybeCase } from 'ghc/base/maybe/maybe'
import { MinBox1 } from 'data/kind'

const functor = maybeFunctor
const foldable = maybeFoldable
const traversable = maybeTraversable
const applicative = maybeApplicative
const monad = maybeMonad
const BiTrav = eitherTBiTraversable(functor, foldable, traversable)

tap.test('EitherT BiTraversable traverses through Maybe', (t) => {
    const expectJust = <T>(value: MaybeBox<T>): T =>
        maybeCase<T, T>({
            just: (inner: T) => inner,
            nothing: () => {
                throw new Error('expected Just')
            },
        })(value)

    const expectEither = <E, A>(value: EitherBox<E, A>): { tag: 'left'; value: E } | { tag: 'right'; value: A } =>
        eitherCase<E, A, { tag: 'left'; value: E } | { tag: 'right'; value: A }>({
            left: (e: E) => ({ tag: 'left', value: e }),
            right: (a: A) => ({ tag: 'right', value: a }),
        })(value)

    const source = eitherT<string, number>(
        () => just(right<string, number>(3)) as unknown as MinBox1<EitherBox<string, number>>,
    )

    const traversed = expectJust(
        BiTrav.bitraverse(
            applicative,
            (e: string) => applicative.pure(e + '!'),
            (n: number) => applicative.pure(n + 1),
            source,
        ) as MaybeBox<EitherTBox<string, number>>,
    )

    const traversedEither = expectEither(expectJust(runEitherT(traversed) as MaybeBox<EitherBox<string, number>>))
    t.same(traversedEither, { tag: 'right', value: 4 })

    const leftSource = eitherT<string, number>(
        () => just(left<string, number>('err')) as unknown as MinBox1<EitherBox<string, number>>,
    )

    const traversedLeft = expectJust(
        BiTrav.bitraverse(
            applicative,
            (e: string) => applicative.pure(e.toUpperCase()),
            (n: number) => applicative.pure(n * 2),
            leftSource,
        ) as MaybeBox<EitherTBox<string, number>>,
    )
    const traversedLeftEither = expectEither(
        expectJust(runEitherT(traversedLeft) as MaybeBox<EitherBox<string, number>>),
    )
    t.same(traversedLeftEither, { tag: 'left', value: 'ERR' })

    const sequenced = expectJust(
        BiTrav.bisequenceA(
            applicative,
            eitherT<string, MinBox1<number>>(
                () =>
                    just(right<string, MinBox1<number>>(applicative.pure(8))) as unknown as MinBox1<
                        EitherBox<string, MinBox1<number>>
                    >,
            ),
        ) as MaybeBox<EitherTBox<string, number>>,
    )
    t.same(expectEither(expectJust(runEitherT(sequenced) as MaybeBox<EitherBox<string, number>>)), {
        tag: 'right',
        value: 8,
    })

    const mappedMonad = expectJust(
        BiTrav.bimapM(
            monad,
            (e: string) => applicative.pure(`${e}?`),
            (n: number) => applicative.pure(n * 3),
            source,
        ) as MaybeBox<EitherTBox<string, number>>,
    )
    t.same(expectEither(expectJust(runEitherT(mappedMonad) as MaybeBox<EitherBox<string, number>>)), {
        tag: 'right',
        value: 9,
    })

    const sequencedMonad = expectJust(
        BiTrav.bisequence(
            monad,
            eitherT<string, MinBox1<number>>(
                () =>
                    just(right<string, MinBox1<number>>(applicative.pure(12))) as unknown as MinBox1<
                        EitherBox<string, MinBox1<number>>
                    >,
            ),
        ) as MaybeBox<EitherTBox<string, number>>,
    )
    t.same(expectEither(expectJust(runEitherT(sequencedMonad) as MaybeBox<EitherBox<string, number>>)), {
        tag: 'right',
        value: 12,
    })

    const nothingResult = BiTrav.bitraverse(
        applicative,
        (e: string) => applicative.pure(e),
        () => nothing<number>(),
        source,
    )
    t.same(maybeCase({ nothing: () => 'nothing', just: () => 'just' })(nothingResult as MaybeBox<unknown>), 'nothing')
    t.end()
})
