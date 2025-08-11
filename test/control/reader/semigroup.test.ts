import tap from 'tap'
import { semigroup as createReaderSemigroup } from 'control/reader/semigroup'
import { reader, ReaderBox, ReaderMinBox } from 'control/reader/reader'
import { semigroup as createListSemigroup } from 'ghc/base/list/semigroup'
import { cons, ListBox, nil, toArray } from 'ghc/base/list/list'
import { formList } from 'ghc/base/non-empty/list'

const listSemigroup = createListSemigroup<number>()
const semigroup = createReaderSemigroup<string, ListBox<number>>(listSemigroup)

const createValue = (separator: string): ReaderBox<string, ListBox<number>> =>
    reader((x: string) =>
        x
            .split('')
            .join(separator)
            .split('')
            .reduceRight((acc, curr) => cons(Number(curr))(acc), nil<number>()),
    )

tap.test('ReaderSemigroup', async (t) => {
    t.test('<>', async (t) => {
        const value1 = createValue('7')
        const value2 = createValue('0')

        const result = semigroup['<>'](value1, value2) as ReaderMinBox<string, ListBox<number>>
        t.same(toArray(result.runReader('123') as ListBox<number>), [1, 7, 2, 7, 3, 1, 0, 2, 0, 3])
    })

    t.test('sconcat', async (t) => {
        const value1 = createValue('1')
        const value2 = createValue('2')
        const value3 = createValue('3')
        const value4 = cons(value3)(cons(value2)(cons(value1)(nil())))

        const result = semigroup.sconcat(formList(value4)) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result.runReader('56') as ListBox<number>), [5, 3, 6, 5, 2, 6, 5, 1, 6])
    })

    t.test('stimes', async (t) => {
        const value1 = createValue('1')

        const result = semigroup.stimes(3, value1) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result.runReader('00') as ListBox<number>), [0, 1, 0, 0, 1, 0, 0, 1, 0])
    })

    t.test('semigroup law - associativity: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const value1 = createValue('11')
        const value2 = createValue('22')
        const value3 = createValue('33')

        const result1 = semigroup['<>'](
            semigroup['<>'](value1, value2) as ReaderMinBox<string, ListBox<number>>,
            value3,
        ) as ReaderMinBox<string, ListBox<number>>
        const result2 = semigroup['<>'](
            value1,
            semigroup['<>'](value2, value3) as ReaderMinBox<string, ListBox<number>>,
        ) as ReaderMinBox<string, ListBox<number>>

        const expected = [5, 1, 1, 6, 5, 2, 2, 6, 5, 3, 3, 6]

        t.same(toArray(result1.runReader('56') as ListBox<number>), expected)
        t.same(toArray(result2.runReader('56') as ListBox<number>), expected)
    })
})
