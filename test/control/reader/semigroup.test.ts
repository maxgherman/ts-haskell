import tap from 'tap'
import { semigroup as createReaderSemigroup } from 'control/reader/semigroup'
import { reader, ReaderBox, ReaderMinBox } from 'control/reader/reader'
import { semigroup as createListSemigroup } from 'ghc/base/list/semigroup'
import { cons, ListBox, nil, toArray } from 'ghc/base/list/list'
import { formList, NonEmptyBox, toList } from 'ghc/base/non-empty/list'
import { semigroup as createMaybeSemigroup } from 'ghc/base/maybe/semigroup'
import { $case as maybeCase, just, MaybeBox } from 'ghc/base/maybe/maybe'
import { semigroup as createEitherSemigroup } from 'data/either/semigroup'
import { $case as eitherCase, left, right, EitherBox } from 'data/either/either'
import { semigroup as createNonEmptySemigroup } from 'ghc/base/non-empty/semigroup'
import { semigroup as createTuple2Semigroup } from 'ghc/base/tuple/tuple2-semigroup'
import { tuple2, fst, snd, TupleMinBox } from 'ghc/base/tuple/tuple'

const listSemigroup = createListSemigroup<number>()
const listReaderSemigroup = createReaderSemigroup<string, ListBox<number>>(listSemigroup)

const buildList = (separator: string, x: string): ListBox<number> =>
    x
        .split('')
        .join(separator)
        .split('')
        .reduceRight((acc, curr) => cons(Number(curr))(acc), nil<number>())

const createListValue = (separator: string): ReaderBox<string, ListBox<number>> =>
    reader((x: string) => buildList(separator, x))

const maybeSemigroup = createMaybeSemigroup<ListBox<number>>(listSemigroup)
const maybeReaderSemigroup = createReaderSemigroup<string, MaybeBox<ListBox<number>>>(maybeSemigroup)

const createMaybeValue = (
    separator: string,
): ReaderBox<string, MaybeBox<ListBox<number>>> =>
    reader((x: string) => just(buildList(separator, x)))

const eitherSemigroup = createEitherSemigroup<Error, string>()
const eitherReaderSemigroup = createReaderSemigroup<string, EitherBox<Error, string>>(eitherSemigroup)

const createEitherRight = (suffix: string): ReaderBox<string, EitherBox<Error, string>> =>
    reader((x: string) => right<Error, string>(x + suffix))
const createEitherLeft = (msg: string): ReaderBox<string, EitherBox<Error, string>> =>
    reader(() => left<Error, string>(new Error(msg)))

const nonEmptySemigroup = createNonEmptySemigroup<number>()
const nonEmptyReaderSemigroup = createReaderSemigroup<string, NonEmptyBox<number>>(nonEmptySemigroup)

const createNonEmptyValue = (
    separator: string,
): ReaderBox<string, NonEmptyBox<number>> =>
    reader((x: string) => formList(buildList(separator, x)))

const tupleSemigroup = createTuple2Semigroup<ListBox<number>, ListBox<number>>(listSemigroup, listSemigroup)
const tupleReaderSemigroup = createReaderSemigroup<
    string,
    TupleMinBox<ListBox<number>, ListBox<number>>
>(tupleSemigroup)

const createTupleValue = (
    sep1: string,
    sep2: string,
): ReaderBox<string, TupleMinBox<ListBox<number>, ListBox<number>>> =>
    reader((x: string) => tuple2(buildList(sep1, x), buildList(sep2, x)))

tap.test('ReaderSemigroup List', async (t) => {
    t.test('<>', async (t) => {
        const value1 = createListValue('7')
        const value2 = createListValue('0')

        const result = listReaderSemigroup['<>'](value1, value2) as ReaderMinBox<string, ListBox<number>>
        t.same(toArray(result.runReader('123') as ListBox<number>), [1, 7, 2, 7, 3, 1, 0, 2, 0, 3])
    })

    t.test('sconcat', async (t) => {
        const value1 = createListValue('1')
        const value2 = createListValue('2')
        const value3 = createListValue('3')
        const value4 = cons(value3)(cons(value2)(cons(value1)(nil())))

        const result = listReaderSemigroup.sconcat(formList(value4)) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result.runReader('56') as ListBox<number>), [5, 3, 6, 5, 2, 6, 5, 1, 6])
    })

    t.test('stimes', async (t) => {
        const value1 = createListValue('1')

        const result = listReaderSemigroup.stimes(3, value1) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result.runReader('00') as ListBox<number>), [0, 1, 0, 0, 1, 0, 0, 1, 0])
    })

    t.test('semigroup law - associativity: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const value1 = createListValue('11')
        const value2 = createListValue('22')
        const value3 = createListValue('33')

        const result1 = listReaderSemigroup['<>'](
            listReaderSemigroup['<>'](value1, value2) as ReaderMinBox<string, ListBox<number>>,
            value3,
        ) as ReaderMinBox<string, ListBox<number>>
        const result2 = listReaderSemigroup['<>'](
            value1,
            listReaderSemigroup['<>'](value2, value3) as ReaderMinBox<string, ListBox<number>>,
        ) as ReaderMinBox<string, ListBox<number>>

        const expected = [5, 1, 1, 6, 5, 2, 2, 6, 5, 3, 3, 6]

        t.same(toArray(result1.runReader('56') as ListBox<number>), expected)
        t.same(toArray(result2.runReader('56') as ListBox<number>), expected)
    })
})

tap.test('ReaderSemigroup Maybe', async (t) => {
    t.test('<>', async (t) => {
        const value1 = createMaybeValue('7')
        const value2 = createMaybeValue('0')

        const result = maybeReaderSemigroup['<>'](
            value1,
            value2,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>
        const toArr = maybeCase<ListBox<number>, number[]>({
            nothing: () => [],
            just: toArray,
        })
        t.same(toArr(result.runReader('123') as MaybeBox<ListBox<number>>), [1, 7, 2, 7, 3, 1, 0, 2, 0, 3])
    })

    t.test('sconcat', async (t) => {
        const value1 = createMaybeValue('1')
        const value2 = createMaybeValue('2')
        const value3 = createMaybeValue('3')
        const value4 = cons(value3)(cons(value2)(cons(value1)(nil())))

        const result = maybeReaderSemigroup.sconcat(
            formList(value4),
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>
        const toArr = maybeCase<ListBox<number>, number[]>({
            nothing: () => [],
            just: toArray,
        })
        t.same(toArr(result.runReader('56') as MaybeBox<ListBox<number>>), [5, 3, 6, 5, 2, 6, 5, 1, 6])
    })

    t.test('stimes', async (t) => {
        const value1 = createMaybeValue('1')

        const result = maybeReaderSemigroup.stimes(
            3,
            value1,
        ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>
        const toArr = maybeCase<ListBox<number>, number[]>({
            nothing: () => [],
            just: toArray,
        })
        t.same(toArr(result.runReader('00') as MaybeBox<ListBox<number>>), [0, 1, 0, 0, 1, 0, 0, 1, 0])
    })

    t.test(
        'semigroup law - associativity: (x <> y) <> z = x <> (y <> z)',
        async (t) => {
            const value1 = createMaybeValue('11')
            const value2 = createMaybeValue('22')
            const value3 = createMaybeValue('33')

            const result1 = maybeReaderSemigroup['<>'](
                maybeReaderSemigroup['<>'](
                    value1,
                    value2,
                ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>,
                value3,
            ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>
            const result2 = maybeReaderSemigroup['<>'](
                value1,
                maybeReaderSemigroup['<>'](
                    value2,
                    value3,
                ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>,
            ) as ReaderMinBox<string, MaybeBox<ListBox<number>>>

            const expected = [5, 1, 1, 6, 5, 2, 2, 6, 5, 3, 3, 6]
            const toArr = maybeCase<ListBox<number>, number[]>({
                nothing: () => [],
                just: toArray,
            })

            t.same(toArr(result1.runReader('56') as MaybeBox<ListBox<number>>), expected)
            t.same(toArr(result2.runReader('56') as MaybeBox<ListBox<number>>), expected)
        },
    )
})

tap.test('ReaderSemigroup Either', async (t) => {
    const rightCase = eitherCase<Error, string, string>({ right: (s) => s })

    t.test('<>', async (t) => {
        const value1 = createEitherRight('A')
        const value2 = createEitherRight('B')
        const value3 = createEitherLeft('err')

        const result1 =
            eitherReaderSemigroup['<>'](value1, value2) as ReaderMinBox<
                string,
                EitherBox<Error, string>
            >
        const result2 =
            eitherReaderSemigroup['<>'](value3, value1) as ReaderMinBox<
                string,
                EitherBox<Error, string>
            >

        t.equal(rightCase(result1.runReader('X') as EitherBox<Error, string>), 'XA')
        t.equal(rightCase(result2.runReader('X') as EitherBox<Error, string>), 'XA')
    })

    t.test('sconcat', async (t) => {
        const value1 = createEitherRight('A')
        const value2 = createEitherRight('B')
        const value3 = createEitherRight('C')
        const values = cons(value3)(cons(value2)(cons(value1)(nil())))

        const result =
            eitherReaderSemigroup.sconcat(
                formList(values),
            ) as ReaderMinBox<string, EitherBox<Error, string>>

        t.equal(
            rightCase(result.runReader('X') as EitherBox<Error, string>),
            'XC',
        )
    })

    t.test('stimes', async (t) => {
        const value1 = createEitherRight('A')

        const result =
            eitherReaderSemigroup.stimes(
                5,
                value1,
            ) as ReaderMinBox<string, EitherBox<Error, string>>

        t.equal(
            rightCase(result.runReader('X') as EitherBox<Error, string>),
            'XA',
        )
    })

    t.test(
        'semigroup law - associativity: (x <> y) <> z = x <> (y <> z)',
        async (t) => {
            const value1 = createEitherRight('A')
            const value2 = createEitherRight('B')
            const value3 = createEitherRight('C')

            const result1 = eitherReaderSemigroup['<>'](
                eitherReaderSemigroup['<>'](
                    value1,
                    value2,
                ) as ReaderMinBox<string, EitherBox<Error, string>>,
                value3,
            ) as ReaderMinBox<string, EitherBox<Error, string>>
            const result2 = eitherReaderSemigroup['<>'](
                value1,
                eitherReaderSemigroup['<>'](
                    value2,
                    value3,
                ) as ReaderMinBox<string, EitherBox<Error, string>>,
            ) as ReaderMinBox<string, EitherBox<Error, string>>

            t.equal(
                rightCase(result1.runReader('X') as EitherBox<Error, string>),
                'XA',
            )
            t.equal(
                rightCase(result2.runReader('X') as EitherBox<Error, string>),
                'XA',
            )
        },
    )
})

tap.test('ReaderSemigroup NonEmptyList', async (t) => {
    t.test('<>', async (t) => {
        const value1 = createNonEmptyValue('7')
        const value2 = createNonEmptyValue('0')

        const result = nonEmptyReaderSemigroup['<>'](
            value1,
            value2,
        ) as ReaderMinBox<string, NonEmptyBox<number>>
        t.same(
            toArray(toList(result.runReader('123') as NonEmptyBox<number>)),
            [1, 7, 2, 7, 3, 1, 0, 2, 0, 3],
        )
    })

    t.test('sconcat', async (t) => {
        const value1 = createNonEmptyValue('1')
        const value2 = createNonEmptyValue('2')
        const value3 = createNonEmptyValue('3')
        const value4 = cons(value3)(cons(value2)(cons(value1)(nil())))

        const result = nonEmptyReaderSemigroup.sconcat(
            formList(value4),
        ) as ReaderMinBox<string, NonEmptyBox<number>>

        t.same(
            toArray(toList(result.runReader('56') as NonEmptyBox<number>)),
            [5, 3, 6, 5, 2, 6, 5, 1, 6],
        )
    })

    t.test('stimes', async (t) => {
        const value1 = createNonEmptyValue('1')

        const result = nonEmptyReaderSemigroup.stimes(
            3,
            value1,
        ) as ReaderMinBox<string, NonEmptyBox<number>>

        t.same(
            toArray(toList(result.runReader('00') as NonEmptyBox<number>)),
            [0, 1, 0, 0, 1, 0, 0, 1, 0],
        )
    })

    t.test(
        'semigroup law - associativity: (x <> y) <> z = x <> (y <> z)',
        async (t) => {
            const value1 = createNonEmptyValue('11')
            const value2 = createNonEmptyValue('22')
            const value3 = createNonEmptyValue('33')

            const result1 = nonEmptyReaderSemigroup['<>'](
                nonEmptyReaderSemigroup['<>'](
                    value1,
                    value2,
                ) as ReaderMinBox<string, NonEmptyBox<number>>,
                value3,
            ) as ReaderMinBox<string, NonEmptyBox<number>>
            const result2 = nonEmptyReaderSemigroup['<>'](
                value1,
                nonEmptyReaderSemigroup['<>'](
                    value2,
                    value3,
                ) as ReaderMinBox<string, NonEmptyBox<number>>,
            ) as ReaderMinBox<string, NonEmptyBox<number>>

            const expected = [5, 1, 1, 6, 5, 2, 2, 6, 5, 3, 3, 6]

            t.same(
                toArray(toList(result1.runReader('56') as NonEmptyBox<number>)),
                expected,
            )
            t.same(
                toArray(toList(result2.runReader('56') as NonEmptyBox<number>)),
                expected,
            )
        },
    )
})

tap.test('ReaderSemigroup Tuple', async (t) => {
    t.test('<>', async (t) => {
        const value1 = createTupleValue('7', '8')
        const value2 = createTupleValue('0', '9')

        const result = tupleReaderSemigroup['<>'](
            value1,
            value2,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

        const tupleResult = result.runReader('123') as TupleMinBox<ListBox<number>, ListBox<number>>
        t.same(toArray(fst(tupleResult) as ListBox<number>), [1, 7, 2, 7, 3, 1, 0, 2, 0, 3])
        t.same(toArray(snd(tupleResult) as ListBox<number>), [1, 8, 2, 8, 3, 1, 9, 2, 9, 3])
    })

    t.test('sconcat', async (t) => {
        const value1 = createTupleValue('1', '4')
        const value2 = createTupleValue('2', '5')
        const value3 = createTupleValue('3', '6')
        const value4 = cons(value3)(cons(value2)(cons(value1)(nil())))

        const result = tupleReaderSemigroup.sconcat(
            formList(value4),
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

        const tupleResult = result.runReader('56') as TupleMinBox<ListBox<number>, ListBox<number>>
        t.same(toArray(fst(tupleResult) as ListBox<number>), [5, 3, 6, 5, 2, 6, 5, 1, 6])
        t.same(toArray(snd(tupleResult) as ListBox<number>), [5, 6, 6, 5, 5, 6, 5, 4, 6])
    })

    t.test('stimes', async (t) => {
        const value1 = createTupleValue('1', '2')

        const result = tupleReaderSemigroup.stimes(
            3,
            value1,
        ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

        const tupleResult = result.runReader('00') as TupleMinBox<ListBox<number>, ListBox<number>>
        t.same(toArray(fst(tupleResult) as ListBox<number>), [0, 1, 0, 0, 1, 0, 0, 1, 0])
        t.same(toArray(snd(tupleResult) as ListBox<number>), [0, 2, 0, 0, 2, 0, 0, 2, 0])
    })

    t.test(
        'semigroup law - associativity: (x <> y) <> z = x <> (y <> z)',
        async (t) => {
            const value1 = createTupleValue('11', '44')
            const value2 = createTupleValue('22', '55')
            const value3 = createTupleValue('33', '66')

            const result1 = tupleReaderSemigroup['<>'](
                tupleReaderSemigroup['<>'](
                    value1,
                    value2,
                ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>,
                value3,
            ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>
            const result2 = tupleReaderSemigroup['<>'](
                value1,
                tupleReaderSemigroup['<>'](
                    value2,
                    value3,
                ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>,
            ) as ReaderMinBox<string, TupleMinBox<ListBox<number>, ListBox<number>>>

            const tuple1 = result1.runReader('56') as TupleMinBox<ListBox<number>, ListBox<number>>
            const tuple2 = result2.runReader('56') as TupleMinBox<ListBox<number>, ListBox<number>>
            const expected1 = [5, 1, 1, 6, 5, 2, 2, 6, 5, 3, 3, 6]
            const expected2 = [5, 4, 4, 6, 5, 5, 5, 6, 5, 6, 6, 6]

            t.same(toArray(fst(tuple1) as ListBox<number>), expected1)
            t.same(toArray(fst(tuple2) as ListBox<number>), expected1)
            t.same(toArray(snd(tuple1) as ListBox<number>), expected2)
            t.same(toArray(snd(tuple2) as ListBox<number>), expected2)
        },
    )
})
