import tap from 'tap'
import { functor as maybeFunctor } from 'ghc/base/maybe/functor'
import { bifunctor as writerTBifunctor } from 'control/monad/trans/writer/bifunctor'
import { writerT, WriterTBox } from 'control/monad/trans/writer/writer-t'
import { tuple2, fst, snd, Tuple2Box } from 'ghc/base/tuple/tuple'
import { MaybeBox, $case as maybeCase, just } from 'ghc/base/maybe/maybe'
import { MinBox1 } from 'data/kind'

const functor = maybeFunctor
const BiFunctor = writerTBifunctor(functor)

const expectJust = <T>(value: MaybeBox<T>): T =>
    maybeCase<T, T>({
        just: (inner) => inner,
        nothing: () => {
            throw new Error('expected Just')
        },
    })(value)

tap.test('WriterT Bifunctor maps log and value positions', (t) => {
    const source = writerT<number, string>(() => just(tuple2('hi', 2)) as unknown as MinBox1<Tuple2Box<string, number>>)

    const mapped = BiFunctor.bimap(
        (log: number) => log + 10,
        (value: string) => value.toUpperCase(),
        source,
    ) as WriterTBox<number, string>

    const mappedTuple = expectJust(mapped.runWriterT() as MaybeBox<Tuple2Box<string, number>>)
    t.same([fst(mappedTuple), snd(mappedTuple)], ['HI', 12])

    const mappedLogOnly = BiFunctor.first((log: number) => log * 3, source) as WriterTBox<number, string>
    const mappedLogTuple = expectJust(mappedLogOnly.runWriterT() as MaybeBox<Tuple2Box<string, number>>)
    t.same([fst(mappedLogTuple), snd(mappedLogTuple)], ['hi', 6])

    const mappedValueOnly = BiFunctor.second((value: string) => `${value}!`, source) as WriterTBox<number, string>
    const mappedValueTuple = expectJust(mappedValueOnly.runWriterT() as MaybeBox<Tuple2Box<string, number>>)
    t.same([fst(mappedValueTuple), snd(mappedValueTuple)], ['hi!', 2])

    t.end()
})
