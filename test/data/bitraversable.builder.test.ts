import tap from 'tap'
import { bitraversable as createBiTraversable, BaseImplementation } from 'data/bitraversable'
import { bifunctor as tupleBifunctor } from 'ghc/base/tuple/tuple2-bifunctor'
import { bifoldable as tupleBiFoldable } from 'ghc/base/tuple/tuple2-bifoldable'
import { tuple2, fst, snd, Tuple2Box } from 'ghc/base/tuple/tuple'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { MaybeBox, nothing, $case } from 'ghc/base/maybe/maybe'
import { MinBox1 } from 'data/kind'

const applicative = maybeApplicative
const monad = maybeMonad

const expectJust = <T>(value: MaybeBox<T>): T =>
    $case<T, T>({
        just: (inner) => inner,
        nothing: () => {
            throw new Error('expected Just')
        },
    })(value)

const baseFromBitraverse: BaseImplementation = {
    bitraverse: <A, B, C, D>(
        app: typeof applicative,
        f: (a: A) => MinBox1<C>,
        g: (b: B) => MinBox1<D>,
        fab: Tuple2Box<A, B>,
    ) => app.liftA2((c: C) => (d: D) => tuple2(c, d), f(fst(fab)) as MaybeBox<C>, g(snd(fab)) as MaybeBox<D>),
}

const baseFromSequence: BaseImplementation = {
    bisequenceA: <A, B>(app: typeof applicative, tfab: Tuple2Box<MinBox1<A>, MinBox1<B>>) =>
        app.liftA2((a: A) => (b: B) => tuple2(a, b), fst(tfab) as MaybeBox<A>, snd(tfab) as MaybeBox<B>),
}

tap.test('BiTraversable builder via bitraverse implementation', (t) => {
    const biTrav = createBiTraversable(baseFromBitraverse, tupleBifunctor(), tupleBiFoldable())
    const source = tuple2(2, 'x') as Tuple2Box<number, string>

    const traversed = biTrav.bitraverse(
        applicative,
        (n: number) => applicative.pure(n + 1),
        (s: string) => applicative.pure(s.toUpperCase()),
        source,
    ) as MaybeBox<Tuple2Box<number, string>>

    const traversedValue = expectJust(traversed)

    t.same([fst(traversedValue), snd(traversedValue)], [3, 'X'])

    const sequenced = biTrav.bisequenceA(
        applicative,
        tuple2(applicative.pure(7), applicative.pure('ok')) as unknown as Tuple2Box<MinBox1<number>, MinBox1<string>>,
    ) as MaybeBox<Tuple2Box<number, string>>

    const sequencedValue = expectJust(sequenced)

    t.same([fst(sequencedValue), snd(sequencedValue)], [7, 'ok'])

    const mappedMonad = biTrav.bimapM(
        monad,
        (n: number) => applicative.pure(n * 2),
        (s: string) => applicative.pure(`${s}!`),
        source,
    ) as MaybeBox<Tuple2Box<number, string>>

    const mappedValue = expectJust(mappedMonad)
    t.same([fst(mappedValue), snd(mappedValue)], [4, 'x!'])

    const sequencedMonad = biTrav.bisequence(
        monad,
        tuple2(applicative.pure(5), applicative.pure(true)) as unknown as Tuple2Box<MinBox1<number>, MinBox1<boolean>>,
    ) as MaybeBox<Tuple2Box<number, boolean>>

    const sequencedMonadValue = expectJust(sequencedMonad)
    t.same([fst(sequencedMonadValue), snd(sequencedMonadValue)], [5, true])

    const kindResult = (biTrav.kind as unknown as (arg: unknown) => 'Constraint')(() => 'Constraint')
    t.equal(kindResult, 'Constraint')

    const nothingResult = biTrav.bitraverse(
        applicative,
        () => applicative.pure(0),
        () => nothing<string>(),
        source,
    )
    t.same(
        $case<Tuple2Box<number, string>, string>({ nothing: () => 'nothing', just: () => 'just' })(
            nothingResult as MaybeBox<Tuple2Box<number, string>>,
        ),
        'nothing',
    )

    t.end()
})

tap.test('BiTraversable builder derives bitraverse from bisequenceA', (t) => {
    const biTrav = createBiTraversable(baseFromSequence, tupleBifunctor(), tupleBiFoldable())

    const source = tuple2(10, 11) as Tuple2Box<number, number>
    const derived = biTrav.bitraverse(
        applicative,
        (n: number) => applicative.pure(n - 5),
        (n: number) => applicative.pure(n + 5),
        source,
    ) as MaybeBox<Tuple2Box<number, number>>

    const value = expectJust(derived)

    t.same([fst(value), snd(value)], [5, 16])
    t.end()
})
