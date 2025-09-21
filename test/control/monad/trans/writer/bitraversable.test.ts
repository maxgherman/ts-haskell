import tap from 'tap'
import { functor as maybeFunctor } from 'ghc/base/maybe/functor'
import { foldable as maybeFoldable } from 'ghc/base/maybe/foldable'
import { traversable as maybeTraversable } from 'ghc/base/maybe/traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { bitraversable as writerTBiTraversable } from 'control/monad/trans/writer/bitraversable'
import { writerT, WriterTBox } from 'control/monad/trans/writer/writer-t'
import { tuple2, fst, snd, Tuple2Box } from 'ghc/base/tuple/tuple'
import { MaybeBox, $case as maybeCase, just, nothing } from 'ghc/base/maybe/maybe'
import { MinBox1 } from 'data/kind'

const functor = maybeFunctor
const foldable = maybeFoldable
const traversable = maybeTraversable
const applicative = maybeApplicative
const monad = maybeMonad
const BiTrav = writerTBiTraversable(functor, foldable, traversable)

const expectJust = <T>(value: MaybeBox<T>): T =>
    maybeCase<T, T>({
        just: (inner) => inner,
        nothing: () => {
            throw new Error('expected Just')
        },
    })(value)

tap.test('WriterT BiTraversable traverses log and value', (t) => {
    const source = writerT<number, string>(
        () => just(tuple2('hello', 3)) as unknown as MinBox1<Tuple2Box<string, number>>,
    )

    const traversed = expectJust(
        BiTrav.bitraverse(
            applicative,
            (log: number) => applicative.pure(log + 1),
            (value: string) => applicative.pure(value.toUpperCase()),
            source,
        ) as MaybeBox<WriterTBox<number, string>>,
    )
    const traversedTuple = expectJust(traversed.runWriterT() as MaybeBox<Tuple2Box<string, number>>)
    t.same([fst(traversedTuple), snd(traversedTuple)], ['HELLO', 4])

    const sequencedInput = writerT<MinBox1<number>, MinBox1<string>>(
        () =>
            just(
                tuple2<MinBox1<string>, MinBox1<number>>(applicative.pure('world'), applicative.pure(9)),
            ) as unknown as MinBox1<Tuple2Box<MinBox1<string>, MinBox1<number>>>,
    )

    const sequenced = expectJust(
        BiTrav.bisequenceA(applicative, sequencedInput) as MaybeBox<WriterTBox<number, string>>,
    )
    const sequencedTuple = expectJust(sequenced.runWriterT() as MaybeBox<Tuple2Box<string, number>>)
    t.same([fst(sequencedTuple), snd(sequencedTuple)], ['world', 9])

    const mappedMonad = expectJust(
        BiTrav.bimapM(
            monad,
            (log: number) => applicative.pure(log * 2),
            (value: string) => applicative.pure(`${value}!`),
            source,
        ) as MaybeBox<WriterTBox<number, string>>,
    )
    const mappedTuple = expectJust(mappedMonad.runWriterT() as MaybeBox<Tuple2Box<string, number>>)
    t.same([fst(mappedTuple), snd(mappedTuple)], ['hello!', 6])

    const sequencedMonad = expectJust(BiTrav.bisequence(monad, sequencedInput) as MaybeBox<WriterTBox<number, string>>)
    const sequencedMonadTuple = expectJust(sequencedMonad.runWriterT() as MaybeBox<Tuple2Box<string, number>>)
    t.same([fst(sequencedMonadTuple), snd(sequencedMonadTuple)], ['world', 9])

    const nothingResult = BiTrav.bitraverse(
        applicative,
        (log: number) => applicative.pure(log),
        () => nothing<string>(),
        source,
    )
    t.same(maybeCase({ nothing: () => 'nothing', just: () => 'just' })(nothingResult as MaybeBox<unknown>), 'nothing')
    t.end()
})
