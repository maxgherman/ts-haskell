import tap from 'tap'
import { tuple2, fst, snd, Tuple2Box } from 'ghc/base/tuple/tuple'
import { bitraversable as tupleBiTraversable } from 'ghc/base/tuple/tuple2-bitraversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { MaybeBox, $case } from 'ghc/base/maybe/maybe'
import { MinBox1 } from 'data/kind'

const applicative = maybeApplicative
const monad = maybeMonad
const BiTrav = tupleBiTraversable()

const expectJust = <T>(value: MaybeBox<T>): T =>
    $case<T, T>({
        just: (inner) => inner,
        nothing: () => {
            throw new Error('expected Just')
        },
    })(value)

tap.test('Tuple2 BiTraversable traverses components', (t) => {
    const pair = tuple2(3, 'x') as Tuple2Box<number, string>

    const traversed = BiTrav.bitraverse(
        applicative,
        (n: number) => applicative.pure(n + 1),
        (s: string) => applicative.pure(s.toUpperCase()),
        pair,
    ) as MaybeBox<Tuple2Box<number, string>>

    const traversedValue = expectJust(traversed)

    t.same([fst(traversedValue), snd(traversedValue)], [4, 'X'])

    const sequenced = BiTrav.bisequenceA(
        applicative,
        tuple2(applicative.pure(9), applicative.pure(false)) as unknown as Tuple2Box<MinBox1<number>, MinBox1<boolean>>,
    ) as MaybeBox<Tuple2Box<number, boolean>>

    const sequencedValue = expectJust(sequenced)

    t.same([fst(sequencedValue), snd(sequencedValue)], [9, false])

    const mappedMonad = BiTrav.bimapM(
        monad,
        (n: number) => applicative.pure(n * 2),
        (s: string) => applicative.pure(`${s}!`),
        pair,
    ) as MaybeBox<Tuple2Box<number, string>>

    const mappedValue = expectJust(mappedMonad)
    t.same([fst(mappedValue), snd(mappedValue)], [6, 'x!'])

    const sequencedMonad = BiTrav.bisequence(
        monad,
        tuple2(applicative.pure(2), applicative.pure('ok')) as unknown as Tuple2Box<MinBox1<number>, MinBox1<string>>,
    ) as MaybeBox<Tuple2Box<number, string>>

    const sequencedMonadValue = expectJust(sequencedMonad)
    t.same([fst(sequencedMonadValue), snd(sequencedMonadValue)], [2, 'ok'])

    t.end()
})
