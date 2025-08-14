import tap from 'tap'
import { monoid as createReaderMonoid } from 'control/reader/monoid'
import { reader, ReaderBox, ReaderMinBox } from 'control/reader/reader'
import { monoid as createListMonoid } from 'ghc/base/list/monoid'
import { cons, nil, toArray, ListBox, List } from 'ghc/base/list/list'
import { monoid as createMaybeMonoid } from 'ghc/base/maybe/monoid'
import { $case as maybeCase, just, MaybeBox } from 'ghc/base/maybe/maybe'
import { monoid as createEitherMonoid } from 'data/either/monoid'
import { $case as eitherCase, left, right, EitherBox } from 'data/either/either'
import { monoid as createTupleMonoid } from 'ghc/base/tuple/tuple2-monoid'
import { tuple2, fst, snd, TupleMinBox } from 'ghc/base/tuple/tuple'
import { monoid as createPromiseMonoid } from 'extra/promise/monoid'
import { PromiseBox } from 'extra/promise/promise'

const listMonoid = createListMonoid<number>()
const listReaderMonoid = createReaderMonoid<string, ListBox<number>>(listMonoid)

const maybeMonoid = createMaybeMonoid<ListBox<number>>(listMonoid)
const maybeReaderMonoid = createReaderMonoid<string, MaybeBox<ListBox<number>>>(maybeMonoid)

const eitherMonoid = createEitherMonoid<ListBox<number>, string>(listMonoid)
const eitherReaderMonoid = createReaderMonoid<string, EitherBox<ListBox<number>, string>>(eitherMonoid)

const tupleMonoid = createTupleMonoid<ListBox<number>, ListBox<number>>(listMonoid, listMonoid)
const tupleReaderMonoid = createReaderMonoid<string, TupleMinBox<ListBox<number>, ListBox<number>>>(tupleMonoid)

const buildList = (separator: string, x: string): ListBox<number> =>
    x
        .split('')
        .join(separator)
        .split('')
        .reduceRight((acc, curr) => cons(Number(curr))(acc), nil<number>())

const createListValue = (separator: string): ReaderBox<string, ListBox<number>> =>
    reader((x: string) => buildList(separator, x))

const createMaybeValue = (separator: string): ReaderBox<string, MaybeBox<ListBox<number>>> =>
    reader((x: string) => just(buildList(separator, x)))

const createEitherLeftValue = (
    separator: string,
): ReaderBox<string, EitherBox<ListBox<number>, string>> =>
    reader((x: string) => left<ListBox<number>, string>(buildList(separator, x)))

const createEitherRightValue = (
    suffix: string,
): ReaderBox<string, EitherBox<ListBox<number>, string>> =>
    reader((x: string) => right<ListBox<number>, string>(x + suffix))

const createTupleValue = (
    sep1: string,
    sep2: string,
): ReaderBox<string, TupleMinBox<ListBox<number>, ListBox<number>>> =>
    reader((x: string) => tuple2(buildList(sep1, x), buildList(sep2, x)))

const promiseMonoid = createPromiseMonoid<ListBox<number>>(listMonoid)
const promiseReaderMonoid = createReaderMonoid<string, PromiseBox<ListBox<number>>>(promiseMonoid)

const createPromiseValue = (separator: string): ReaderBox<string, PromiseBox<ListBox<number>>> =>
    reader((x: string) => Promise.resolve(buildList(separator, x)) as PromiseBox<ListBox<number>>)

tap.test('ReaderMonoid List', async (t) => {
    t.test('mempty', async (t) => {
        const result = listReaderMonoid.mempty as ReaderMinBox<string, ListBox<number>>
        t.same(toArray(result.runReader('123') as ListBox<number>), [])
    })

    t.test('<>', async (t) => {
        const value1 = createListValue('1')
        const value2 = createListValue('2')

        const result = listReaderMonoid['<>'](value1, value2) as ReaderMinBox<string, ListBox<number>>
        t.same(toArray(result.runReader('34') as ListBox<number>), [3, 1, 4, 3, 2, 4])
    })

    t.test('mappend', async (t) => {
        const value1 = createListValue('3')
        const value2 = createListValue('4')

        const result = listReaderMonoid.mappend(value1, value2) as ReaderMinBox<string, ListBox<number>>
        t.same(toArray(result.runReader('56') as ListBox<number>), [5, 3, 6, 5, 4, 6])
    })

    t.test('mconcat', async (t) => {
        const value1 = createListValue('1')
        const value2 = createListValue('2')
        const value3 = createListValue('3')

        const list = cons(value3)(cons(value2)(cons(value1)(nil() as List<ReaderBox<string, ListBox<number>>>)))
        const result = listReaderMonoid.mconcat(
            list as List<ReaderMinBox<string, ListBox<number>>>,
        ) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result.runReader('78') as ListBox<number>), [7, 3, 8, 7, 2, 8, 7, 1, 8])
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const value1 = createListValue('1')
        const value2 = createListValue('2')
        const value3 = createListValue('3')

        const result1 = listReaderMonoid['<>'](
            listReaderMonoid['<>'](value1, value2) as ReaderMinBox<string, ListBox<number>>,
            value3,
        ) as ReaderMinBox<string, ListBox<number>>
        const result2 = listReaderMonoid['<>'](
            value1,
            listReaderMonoid['<>'](value2, value3) as ReaderMinBox<string, ListBox<number>>,
        ) as ReaderMinBox<string, ListBox<number>>

        const expected = [7, 1, 8, 7, 2, 8, 7, 3, 8]

        t.same(toArray(result1.runReader('78') as ListBox<number>), expected)
        t.same(toArray(result2.runReader('78') as ListBox<number>), expected)
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const value1 = createListValue('1')
        const value2 = createListValue('2')

        const result1 = listReaderMonoid['<>'](
            listReaderMonoid.mempty,
            value1,
        ) as ReaderMinBox<string, ListBox<number>>
        const result2 = listReaderMonoid['<>'](
            listReaderMonoid.mempty,
            value2,
        ) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result1.runReader('12') as ListBox<number>), toArray(value1.runReader('12')))
        t.same(toArray(result2.runReader('12') as ListBox<number>), toArray(value2.runReader('12')))
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const value1 = createListValue('1')
        const value2 = createListValue('2')

        const result1 = listReaderMonoid['<>'](
            value1,
            listReaderMonoid.mempty,
        ) as ReaderMinBox<string, ListBox<number>>
        const result2 = listReaderMonoid['<>'](
            value2,
            listReaderMonoid.mempty,
        ) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result1.runReader('12') as ListBox<number>), toArray(value1.runReader('12')))
        t.same(toArray(result2.runReader('12') as ListBox<number>), toArray(value2.runReader('12')))
    })
})

tap.test('ReaderMonoid Maybe', async (t) => {
    const toArr = maybeCase<ListBox<number>, number[]>({
        nothing: () => [],
        just: toArray,
    })

    t.test('mempty', async (t) => {
        const result = maybeReaderMonoid.mempty as ReaderMinBox<string, MaybeBox<ListBox<number>>>
        t.same(toArr(result.runReader('123') as MaybeBox<ListBox<number>>), [])
    })

    t.test('<>', async (t) => {
        const value1 = createMaybeValue('1')
        const value2 = createMaybeValue('2')

        const result = maybeReaderMonoid['<>'](
            value1,
            value2,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>
        t.same(toArr(result.runReader('34') as MaybeBox<ListBox<number>>), [3, 1, 4, 3, 2, 4])
    })

    t.test('mappend', async (t) => {
        const value1 = createMaybeValue('3')
        const value2 = createMaybeValue('4')

        const result = maybeReaderMonoid.mappend(
            value1,
            value2,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>
        t.same(toArr(result.runReader('56') as MaybeBox<ListBox<number>>), [5, 3, 6, 5, 4, 6])
    })

    t.test('mconcat', async (t) => {
        const value1 = createMaybeValue('1')
        const value2 = createMaybeValue('2')
        const value3 = createMaybeValue('3')

        const list = cons(value3)(
            cons(value2)(
                cons(value1)(
                    nil() as List<ReaderBox<string, MaybeBox<ListBox<number>>>>,
                ),
            ),
        )
        const result = maybeReaderMonoid.mconcat(
            list as List<ReaderMinBox<string, MaybeBox<ListBox<number>>>>,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>

        t.same(toArr(result.runReader('78') as MaybeBox<ListBox<number>>), [7, 3, 8, 7, 2, 8, 7, 1, 8])
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const value1 = createMaybeValue('1')
        const value2 = createMaybeValue('2')
        const value3 = createMaybeValue('3')

        const result1 = maybeReaderMonoid['<>'](
            maybeReaderMonoid['<>'](value1, value2) as ReaderMinBox<
                string,
                MaybeBox<ListBox<number>>
            >,
            value3,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>
        const result2 = maybeReaderMonoid['<>'](
            value1,
            maybeReaderMonoid['<>'](value2, value3) as ReaderMinBox<
                string,
                MaybeBox<ListBox<number>>
            >,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>

        const expected = [7, 1, 8, 7, 2, 8, 7, 3, 8]

        t.same(toArr(result1.runReader('78') as MaybeBox<ListBox<number>>), expected)
        t.same(toArr(result2.runReader('78') as MaybeBox<ListBox<number>>), expected)
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const value1 = createMaybeValue('1')
        const value2 = createMaybeValue('2')

        const result1 = maybeReaderMonoid['<>'](
            maybeReaderMonoid.mempty,
            value1,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>
        const result2 = maybeReaderMonoid['<>'](
            maybeReaderMonoid.mempty,
            value2,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>

        t.same(toArr(result1.runReader('12') as MaybeBox<ListBox<number>>), toArr(value1.runReader('12')))
        t.same(toArr(result2.runReader('12') as MaybeBox<ListBox<number>>), toArr(value2.runReader('12')))
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const value1 = createMaybeValue('1')
        const value2 = createMaybeValue('2')

        const result1 = maybeReaderMonoid['<>'](
            value1,
            maybeReaderMonoid.mempty,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>
        const result2 = maybeReaderMonoid['<>'](
            value2,
            maybeReaderMonoid.mempty,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>

        t.same(toArr(result1.runReader('12') as MaybeBox<ListBox<number>>), toArr(value1.runReader('12')))
        t.same(toArr(result2.runReader('12') as MaybeBox<ListBox<number>>), toArr(value2.runReader('12')))
    })
})

tap.test('ReaderMonoid Either', async (t) => {
    const toVal = eitherCase<ListBox<number>, string, string | number[]>({
        left: toArray,
        right: (s) => s,
    })

    t.test('mempty', async (t) => {
        const result = eitherReaderMonoid.mempty as ReaderMinBox<
            string,
            EitherBox<ListBox<number>, string>
        >
        t.same(toVal(result.runReader('123') as EitherBox<ListBox<number>, string>), [])
    })

    t.test('<>', async (t) => {
        const value1 = createEitherLeftValue('1')
        const value2 = createEitherLeftValue('2')

        const result = eitherReaderMonoid['<>'](
            value1,
            value2,
        ) as ReaderMinBox<string, EitherBox<ListBox<number>, string>>

        t.same(toVal(result.runReader('34') as EitherBox<ListBox<number>, string>), [3, 1, 4, 3, 2, 4])
    })

    t.test('mappend', async (t) => {
        const value1 = createEitherLeftValue('3')
        const value2 = createEitherLeftValue('4')

        const result = eitherReaderMonoid.mappend(
            value1,
            value2,
        ) as ReaderMinBox<string, EitherBox<ListBox<number>, string>>

        t.same(toVal(result.runReader('56') as EitherBox<ListBox<number>, string>), [5, 3, 6, 5, 4, 6])
    })

    t.test('mconcat', async (t) => {
        const value1 = createEitherLeftValue('1')
        const value2 = createEitherLeftValue('2')
        const value3 = createEitherLeftValue('3')

        const list = cons(value3)(
            cons(value2)(
                cons(value1)(
                    nil() as List<ReaderBox<string, EitherBox<ListBox<number>, string>>>,
                ),
            ),
        )
        const result = eitherReaderMonoid.mconcat(
            list as List<ReaderMinBox<string, EitherBox<ListBox<number>, string>>>,
        ) as ReaderMinBox<string, EitherBox<ListBox<number>, string>>

        t.same(toVal(result.runReader('78') as EitherBox<ListBox<number>, string>), [7, 3, 8, 7, 2, 8, 7, 1, 8])
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const value1 = createEitherLeftValue('1')
        const value2 = createEitherLeftValue('2')
        const value3 = createEitherLeftValue('3')

        const result1 = eitherReaderMonoid['<>'](
            eitherReaderMonoid['<>'](value1, value2) as ReaderMinBox<
                string,
                EitherBox<ListBox<number>, string>
            >,
            value3,
        ) as ReaderMinBox<string, EitherBox<ListBox<number>, string>>
        const result2 = eitherReaderMonoid['<>'](
            value1,
            eitherReaderMonoid['<>'](value2, value3) as ReaderMinBox<
                string,
                EitherBox<ListBox<number>, string>
            >,
        ) as ReaderMinBox<string, EitherBox<ListBox<number>, string>>

        const expected = [7, 1, 8, 7, 2, 8, 7, 3, 8]

        t.same(toVal(result1.runReader('78') as EitherBox<ListBox<number>, string>), expected)
        t.same(toVal(result2.runReader('78') as EitherBox<ListBox<number>, string>), expected)
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const valueL = createEitherLeftValue('1')
        const valueR = createEitherRightValue('!')

        const result1 = eitherReaderMonoid['<>'](
            eitherReaderMonoid.mempty,
            valueL,
        ) as ReaderMinBox<string, EitherBox<ListBox<number>, string>>
        const result2 = eitherReaderMonoid['<>'](
            eitherReaderMonoid.mempty,
            valueR,
        ) as ReaderMinBox<string, EitherBox<ListBox<number>, string>>

        t.same(
            toVal(result1.runReader('12') as EitherBox<ListBox<number>, string>),
            toVal(valueL.runReader('12')),
        )
        t.same(
            toVal(result2.runReader('ab') as EitherBox<ListBox<number>, string>),
            toVal(valueR.runReader('ab')),
        )
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const valueL = createEitherLeftValue('1')
        const valueR = createEitherRightValue('!')

        const result1 = eitherReaderMonoid['<>'](
            valueL,
            eitherReaderMonoid.mempty,
        ) as ReaderMinBox<string, EitherBox<ListBox<number>, string>>
        const result2 = eitherReaderMonoid['<>'](
            valueR,
            eitherReaderMonoid.mempty,
        ) as ReaderMinBox<string, EitherBox<ListBox<number>, string>>

        t.same(
            toVal(result1.runReader('12') as EitherBox<ListBox<number>, string>),
            toVal(valueL.runReader('12')),
        )
        t.same(
            toVal(result2.runReader('ab') as EitherBox<ListBox<number>, string>),
            toVal(valueR.runReader('ab')),
        )
    })
})

tap.test('ReaderMonoid Tuple', async (t) => {
    const toArrs = (
        x: TupleMinBox<ListBox<number>, ListBox<number>>,
    ): [number[], number[]] => [
        toArray(fst(x) as ListBox<number>),
        toArray(snd(x) as ListBox<number>),
    ]

    t.test('mempty', async (t) => {
        const result = tupleReaderMonoid.mempty as ReaderMinBox<
            string,
            TupleMinBox<ListBox<number>, ListBox<number>>
        >
        t.same(
            toArrs(result.runReader('123') as TupleMinBox<ListBox<number>, ListBox<number>>),
            [[], []],
        )
    })

    t.test('<>', async (t) => {
        const value1 = createTupleValue('1', '2')
        const value2 = createTupleValue('3', '4')

        const result = tupleReaderMonoid['<>'](
            value1,
            value2,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

        t.same(
            toArrs(result.runReader('34') as TupleMinBox<ListBox<number>, ListBox<number>>),
            [
                [3, 1, 4, 3, 3, 4],
                [3, 2, 4, 3, 4, 4],
            ],
        )
    })

    t.test('mappend', async (t) => {
        const value1 = createTupleValue('3', '4')
        const value2 = createTupleValue('5', '6')

        const result = tupleReaderMonoid.mappend(
            value1,
            value2,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

        t.same(
            toArrs(result.runReader('56') as TupleMinBox<ListBox<number>, ListBox<number>>),
            [
                [5, 3, 6, 5, 5, 6],
                [5, 4, 6, 5, 6, 6],
            ],
        )
    })

    t.test('mconcat', async (t) => {
        const value1 = createTupleValue('1', '2')
        const value2 = createTupleValue('3', '4')
        const value3 = createTupleValue('5', '6')

        const list = cons(value3)(
            cons(value2)(
                cons(value1)(
                    nil() as List<
                        ReaderBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>
                    >,
                ),
            ),
        )
        const result = tupleReaderMonoid.mconcat(
            list as List<
                ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>
            >,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

        t.same(
            toArrs(result.runReader('78') as TupleMinBox<ListBox<number>, ListBox<number>>),
            [
                [7, 5, 8, 7, 3, 8, 7, 1, 8],
                [7, 6, 8, 7, 4, 8, 7, 2, 8],
            ],
        )
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const value1 = createTupleValue('1', '2')
        const value2 = createTupleValue('3', '4')
        const value3 = createTupleValue('5', '6')

        const result1 = tupleReaderMonoid['<>'](
            tupleReaderMonoid['<>'](value1, value2) as ReaderMinBox<
                string,
                TupleMinBox<ListBox<number>, ListBox<number>>
            >,
            value3,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>
        const result2 = tupleReaderMonoid['<>'](
            value1,
            tupleReaderMonoid['<>'](value2, value3) as ReaderMinBox<
                string,
                TupleMinBox<ListBox<number>, ListBox<number>>
            >,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

        const expected: [number[], number[]] = [
            [7, 1, 8, 7, 3, 8, 7, 5, 8],
            [7, 2, 8, 7, 4, 8, 7, 6, 8],
        ]

        t.same(
            toArrs(result1.runReader('78') as TupleMinBox<ListBox<number>, ListBox<number>>),
            expected,
        )
        t.same(
            toArrs(result2.runReader('78') as TupleMinBox<ListBox<number>, ListBox<number>>),
            expected,
        )
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const value1 = createTupleValue('1', '2')
        const value2 = createTupleValue('3', '4')

        const result1 = tupleReaderMonoid['<>'](
            tupleReaderMonoid.mempty,
            value1,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>
        const result2 = tupleReaderMonoid['<>'](
            tupleReaderMonoid.mempty,
            value2,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

        t.same(
            toArrs(result1.runReader('12') as TupleMinBox<ListBox<number>, ListBox<number>>),
            toArrs(value1.runReader('12') as TupleMinBox<ListBox<number>, ListBox<number>>),
        )
        t.same(
            toArrs(result2.runReader('12') as TupleMinBox<ListBox<number>, ListBox<number>>),
            toArrs(value2.runReader('12') as TupleMinBox<ListBox<number>, ListBox<number>>),
        )
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const value1 = createTupleValue('1', '2')
        const value2 = createTupleValue('3', '4')

        const result1 = tupleReaderMonoid['<>'](
            value1,
            tupleReaderMonoid.mempty,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>
        const result2 = tupleReaderMonoid['<>'](
            value2,
            tupleReaderMonoid.mempty,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

        t.same(
            toArrs(result1.runReader('12') as TupleMinBox<ListBox<number>, ListBox<number>>),
            toArrs(value1.runReader('12') as TupleMinBox<ListBox<number>, ListBox<number>>),
        )
        t.same(
            toArrs(result2.runReader('12') as TupleMinBox<ListBox<number>, ListBox<number>>),
            toArrs(value2.runReader('12') as TupleMinBox<ListBox<number>, ListBox<number>>),
        )
    })
})

tap.test('ReaderMonoid Promise', async (t) => {
    const toArr = async (p: PromiseBox<ListBox<number>>) =>
        toArray(await p)

    t.test('mempty', async (t) => {
        const result = promiseReaderMonoid.mempty as ReaderMinBox<string, PromiseBox<ListBox<number>>>
        t.same(await toArr(result.runReader('123') as PromiseBox<ListBox<number>>), [])
    })

    t.test('<>', async (t) => {
        const value1 = createPromiseValue('1')
        const value2 = createPromiseValue('2')

        const result = promiseReaderMonoid['<>'](value1, value2) as ReaderMinBox<string, PromiseBox<ListBox<number>>>
        t.same(
            await toArr(result.runReader('34') as PromiseBox<ListBox<number>>),
            [3, 1, 4, 3, 2, 4],
        )
    })

    t.test('mappend', async (t) => {
        const value1 = createPromiseValue('3')
        const value2 = createPromiseValue('4')

        const result = promiseReaderMonoid.mappend(
            value1,
            value2,
        ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>

        t.same(
            await toArr(result.runReader('56') as PromiseBox<ListBox<number>>),
            [5, 3, 6, 5, 4, 6],
        )
    })

    t.test('mconcat', async (t) => {
        const value1 = createPromiseValue('1')
        const value2 = createPromiseValue('2')
        const value3 = createPromiseValue('3')

        const list = cons(value3)(
            cons(value2)(
                cons(value1)(
                    nil() as List<ReaderBox<string, PromiseBox<ListBox<number>>>>,
                ),
            ),
        )
        const result = promiseReaderMonoid.mconcat(
            list as List<ReaderMinBox<string, PromiseBox<ListBox<number>>>>,
        ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>

        t.same(
            await toArr(result.runReader('78') as PromiseBox<ListBox<number>>),
            [7, 3, 8, 7, 2, 8, 7, 1, 8],
        )
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const value1 = createPromiseValue('1')
        const value2 = createPromiseValue('2')
        const value3 = createPromiseValue('3')

        const result1 = promiseReaderMonoid['<>'](
            promiseReaderMonoid['<>'](
                value1,
                value2,
            ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>,
            value3,
        ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>
        const result2 = promiseReaderMonoid['<>'](
            value1,
            promiseReaderMonoid['<>'](
                value2,
                value3,
            ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>,
        ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>

        const expected = [7, 1, 8, 7, 2, 8, 7, 3, 8]

        t.same(
            await toArr(result1.runReader('78') as PromiseBox<ListBox<number>>),
            expected,
        )
        t.same(
            await toArr(result2.runReader('78') as PromiseBox<ListBox<number>>),
            expected,
        )
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const value1 = createPromiseValue('1')
        const value2 = createPromiseValue('2')

        const result1 = promiseReaderMonoid['<>'](
            promiseReaderMonoid.mempty,
            value1,
        ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>
        const result2 = promiseReaderMonoid['<>'](
            promiseReaderMonoid.mempty,
            value2,
        ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>

        t.same(
            await toArr(result1.runReader('12') as PromiseBox<ListBox<number>>),
            await toArr(value1.runReader('12') as PromiseBox<ListBox<number>>),
        )
        t.same(
            await toArr(result2.runReader('12') as PromiseBox<ListBox<number>>),
            await toArr(value2.runReader('12') as PromiseBox<ListBox<number>>),
        )
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const value1 = createPromiseValue('1')
        const value2 = createPromiseValue('2')

        const result1 = promiseReaderMonoid['<>'](
            value1,
            promiseReaderMonoid.mempty,
        ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>
        const result2 = promiseReaderMonoid['<>'](
            value2,
            promiseReaderMonoid.mempty,
        ) as ReaderMinBox<string, PromiseBox<ListBox<number>>>

        t.same(
            await toArr(result1.runReader('12') as PromiseBox<ListBox<number>>),
            await toArr(value1.runReader('12') as PromiseBox<ListBox<number>>),
        )
        t.same(
            await toArr(result2.runReader('12') as PromiseBox<ListBox<number>>),
            await toArr(value2.runReader('12') as PromiseBox<ListBox<number>>),
        )
    })
})

