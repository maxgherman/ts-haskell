import tap from 'tap'
import { bitraversable as eitherBiTraversable } from 'data/either/bitraversable'
import { left, right, EitherBox, $case as eitherCase } from 'data/either/either'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { MaybeBox, nothing, $case as maybeCase } from 'ghc/base/maybe/maybe'
import { MinBox1 } from 'data/kind'

const applicative = maybeApplicative
const monad = maybeMonad
const BiTrav = eitherBiTraversable()

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

tap.test('Either BiTraversable traverses and sequences', (t) => {
    const source = right<string, number>(2) as EitherBox<string, number>

    const traversed = expectJust(
        BiTrav.bitraverse(
            applicative,
            (e: string) => applicative.pure(e.toUpperCase()),
            (n: number) => applicative.pure(n + 1),
            source,
        ) as MaybeBox<EitherBox<string, number>>,
    )
    t.same(expectEither(traversed), { tag: 'right', value: 3 })

    const leftSource = left<string, number>('err') as EitherBox<string, number>
    const traversedLeft = expectJust(
        BiTrav.bitraverse(
            applicative,
            (e: string) => applicative.pure(`${e}!`),
            (n: number) => applicative.pure(n + 1),
            leftSource,
        ) as MaybeBox<EitherBox<string, number>>,
    )
    t.same(expectEither(traversedLeft), { tag: 'left', value: 'err!' })

    const sequenced = expectJust(
        BiTrav.bisequenceA(
            applicative,
            right<MinBox1<string>, MinBox1<number>>(applicative.pure(42)) as EitherBox<
                MinBox1<string>,
                MinBox1<number>
            >,
        ) as MaybeBox<EitherBox<string, number>>,
    )
    t.same(expectEither(sequenced), { tag: 'right', value: 42 })

    const mappedMonad = expectJust(
        BiTrav.bimapM(
            monad,
            (e: string) => applicative.pure(e + '?'),
            (n: number) => applicative.pure(n * 2),
            source,
        ) as MaybeBox<EitherBox<string, number>>,
    )
    t.same(expectEither(mappedMonad), { tag: 'right', value: 4 })

    const sequencedMonad = expectJust(
        BiTrav.bisequence(
            monad,
            right<MinBox1<string>, MinBox1<number>>(applicative.pure(99)) as EitherBox<
                MinBox1<string>,
                MinBox1<number>
            >,
        ) as MaybeBox<EitherBox<string, number>>,
    )
    t.same(expectEither(sequencedMonad), { tag: 'right', value: 99 })

    const kindResult = (BiTrav.kind as unknown as (arg: unknown) => 'Constraint')(() => 'Constraint')
    t.equal(kindResult, 'Constraint')

    const nothingCase = BiTrav.bitraverse(
        applicative,
        () => applicative.pure('noop'),
        () => nothing<number>(),
        source,
    )
    t.same(maybeCase({ nothing: () => 'nothing', just: () => 'just' })(nothingCase as MaybeBox<unknown>), 'nothing')
    t.end()
})
