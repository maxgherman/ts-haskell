import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { functor as createFunctor } from 'control/writer/functor'
import { writer, runWriter, WriterBox } from 'control/writer/writer'
import { $case as maybeCase, just, nothing, MaybeBox } from 'ghc/base/maybe/maybe'
import {
    $case as eitherCase,
    left,
    right,
    EitherBox,
} from 'data/either/either'
import { fst, snd, tuple2, Tuple2Box } from 'ghc/base/tuple/tuple'
import { PromiseBox } from 'extra/promise/promise'
import { functor as promiseFunctor } from 'extra/promise/functor'

const functor = createFunctor<string>()
const numberWriter = writer(() => tuple2(3, 'log'))

const fmapId = (fa: WriterBox<string, number>) => functor.fmap(id, fa)

tap.test('WriterFunctor functor', async (t) => {
    t.test('fmap', async (t) => {
        const result = functor.fmap((x: number) => x + 1, numberWriter)
        const tuple = runWriter(result)
        t.equal(fst(tuple), 4)
        t.equal(snd(tuple), 'log')
    })

    t.test('<$>', async (t) => {
        const result = functor['<$>']((x: number) => x * 2, numberWriter)
        const tuple = runWriter(result)
        t.equal(fst(tuple), 6)
        t.equal(snd(tuple), 'log')
    })

    t.test('<$', async (t) => {
        const result = functor['<$'](5, numberWriter)
        const tuple = runWriter(result)
        t.equal(fst(tuple), 5)
        t.equal(snd(tuple), 'log')
    })

    t.test('$>', async (t) => {
        const result = functor['$>'](numberWriter, 7)
        const tuple = runWriter(result)
        t.equal(fst(tuple), 7)
        t.equal(snd(tuple), 'log')
    })

    t.test('<&>', async (t) => {
        const result = functor['<&>'](numberWriter, (x: number) => x + 2)
        const tuple = runWriter(result)
        t.equal(fst(tuple), 5)
        t.equal(snd(tuple), 'log')
    })

    t.test('void', async (t) => {
        const result = functor.void(numberWriter)
        const tuple = runWriter(result)
        t.same(fst(tuple), [])
        t.equal(snd(tuple), 'log')
    })

    t.test('Functor with Maybe', async (t) => {
        const justWriter = writer(() => tuple2(just(3), 'log1'))
        const nothingWriter = writer(() => tuple2(nothing<number>(), 'log2'))

        const mapper = (m: MaybeBox<number>) =>
            maybeCase<number, MaybeBox<number>>({
                just: (x) => just(x + 1),
                nothing: () => nothing<number>(),
            })(m)

        const mappedJust = functor.fmap(mapper, justWriter)
        const mappedNothing = functor.fmap(mapper, nothingWriter)

        const runJust = maybeCase<number, number | undefined>({
            just: (x) => x,
            nothing: () => undefined,
        })(runWriter(mappedJust)[0] as MaybeBox<number>)
        const runNothing = maybeCase<number, number | undefined>({
            just: (x) => x,
            nothing: () => undefined,
        })(runWriter(mappedNothing)[0] as MaybeBox<number>)

        t.equal(runJust, 4)
        t.equal(runNothing, undefined)
        t.equal(runWriter(mappedJust)[1], 'log1')
        t.equal(runWriter(mappedNothing)[1], 'log2')
    })

    t.test('Functor with Either', async (t) => {
        const rightWriter = writer(() => tuple2(right<string, number>(3), 'log1'))
        const leftWriter = writer(() => tuple2(left<string, number>('err'), 'log2'))

        const mapper = (e: EitherBox<string, number>) =>
            eitherCase<string, number, EitherBox<string, number>>({
                left: (l) => left<string, number>(l + '!'),
                right: (r) => right<string, number>(r + 1),
            })(e)

        const mappedRight = functor.fmap(mapper, rightWriter)
        const mappedLeft = functor.fmap(mapper, leftWriter)

        const runRight = eitherCase<string, number, string | number>({
            left: (l) => l,
            right: (r) => r,
        })(runWriter(mappedRight)[0] as EitherBox<string, number>)
        const runLeft = eitherCase<string, number, string | number>({
            left: (l) => l,
            right: (r) => r,
        })(runWriter(mappedLeft)[0] as EitherBox<string, number>)

        t.equal(runRight, 4)
        t.equal(runLeft, 'err!')
        t.equal(runWriter(mappedRight)[1], 'log1')
        t.equal(runWriter(mappedLeft)[1], 'log2')
    })

    t.test('Functor with Tuple', async (t) => {
        const tupleWriter = writer(() => tuple2(tuple2(1, 'a'), 'log'))

        const mapped = functor.fmap(
            (p: Tuple2Box<number, string>) =>
                tuple2(fst(p) + 1, snd(p).toUpperCase()),
            tupleWriter,
        )

        const tuple = runWriter(mapped)[0] as Tuple2Box<number, string>
        t.equal(fst(tuple), 2)
        t.equal(snd(tuple), 'A')
        t.equal(runWriter(mapped)[1], 'log')
    })

    t.test('Functor with Promise', async (t) => {
        const promiseWriter = writer(
            () =>
                tuple2(Promise.resolve(3) as PromiseBox<number>, 'log'),
        )

        const mapped = functor.fmap(
            (p: PromiseBox<number>) =>
                promiseFunctor.fmap((x: number) => x + 1, p),
            promiseWriter,
        )

        t.equal(await (runWriter(mapped)[0] as PromiseBox<number>), 4)
        t.equal(runWriter(mapped)[1], 'log')
    })

    t.test('Functor first law: fmap id = id', async (t) => {
        const result = fmapId(numberWriter)
        const expected = id(numberWriter)

        const resultTuple = runWriter(result)
        const expectedTuple = runWriter(expected)

        t.equal(fst(resultTuple), fst(expectedTuple))
        t.equal(snd(resultTuple), snd(expectedTuple))
    })

    t.test('Functor second law: fmap (f . g) = fmap f . fmap g', async (t) => {
        const a = (x: number) => x + 2
        const b = (x: number) => x * 3
        const ab = compose(a, b)
        const fA = (fa: WriterBox<string, number>) => functor.fmap(a, fa)
        const fB = (fb: WriterBox<string, number>) => functor.fmap(b, fb)
        const fAB = (fab: WriterBox<string, number>) => functor.fmap(ab, fab)
        const fAfB = compose(fA, fB)

        const one = fAB(numberWriter)
        const two = fAfB(numberWriter)

        const oneTuple = runWriter(one)
        const twoTuple = runWriter(two)

        t.equal(fst(oneTuple), fst(twoTuple))
        t.equal(snd(oneTuple), snd(twoTuple))
    })
})

