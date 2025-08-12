import tap from 'tap'
import { monoid as createReaderMonoid } from 'control/reader/monoid'
import { reader, ReaderBox, ReaderMinBox } from 'control/reader/reader'
import { monoid as createListMonoid } from 'ghc/base/list/monoid'
import { cons, nil, toArray, ListBox, List } from 'ghc/base/list/list'

const listMonoid = createListMonoid<number>()
const monoid = createReaderMonoid<string, ListBox<number>>(listMonoid)

const createValue = (separator: string): ReaderBox<string, ListBox<number>> =>
    reader((x: string) =>
        x
            .split('')
            .join(separator)
            .split('')
            .reduceRight((acc, curr) => cons(Number(curr))(acc), nil<number>()),
    )

tap.test('ReaderMonoid', async (t) => {
    t.test('mempty', async (t) => {
        const result = monoid.mempty as ReaderMinBox<string, ListBox<number>>
        t.same(toArray(result.runReader('123') as ListBox<number>), [])
    })

    t.test('<>', async (t) => {
        const value1 = createValue('1')
        const value2 = createValue('2')

        const result = monoid['<>'](value1, value2) as ReaderMinBox<string, ListBox<number>>
        t.same(toArray(result.runReader('34') as ListBox<number>), [3, 1, 4, 3, 2, 4])
    })

    t.test('mappend', async (t) => {
        const value1 = createValue('3')
        const value2 = createValue('4')

        const result = monoid.mappend(value1, value2) as ReaderMinBox<string, ListBox<number>>
        t.same(toArray(result.runReader('56') as ListBox<number>), [5, 3, 6, 5, 4, 6])
    })

    t.test('mconcat', async (t) => {
        const value1 = createValue('1')
        const value2 = createValue('2')
        const value3 = createValue('3')

        const list = cons(value3)(cons(value2)(cons(value1)(nil() as List<ReaderBox<string, ListBox<number>>>)))
        const result = monoid.mconcat(list as List<ReaderMinBox<string, ListBox<number>>>) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result.runReader('78') as ListBox<number>), [7, 3, 8, 7, 2, 8, 7, 1, 8])
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const value1 = createValue('1')
        const value2 = createValue('2')
        const value3 = createValue('3')

        const result1 = monoid['<>'](
            monoid['<>'](value1, value2) as ReaderMinBox<string, ListBox<number>>,
            value3,
        ) as ReaderMinBox<string, ListBox<number>>
        const result2 = monoid['<>'](
            value1,
            monoid['<>'](value2, value3) as ReaderMinBox<string, ListBox<number>>,
        ) as ReaderMinBox<string, ListBox<number>>

        const expected = [7, 1, 8, 7, 2, 8, 7, 3, 8]

        t.same(toArray(result1.runReader('78') as ListBox<number>), expected)
        t.same(toArray(result2.runReader('78') as ListBox<number>), expected)
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const value1 = createValue('1')
        const value2 = createValue('2')

        const result1 = monoid['<>'](monoid.mempty, value1) as ReaderMinBox<string, ListBox<number>>
        const result2 = monoid['<>'](monoid.mempty, value2) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result1.runReader('12') as ListBox<number>), toArray(value1.runReader('12')))
        t.same(toArray(result2.runReader('12') as ListBox<number>), toArray(value2.runReader('12')))
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const value1 = createValue('1')
        const value2 = createValue('2')

        const result1 = monoid['<>'](value1, monoid.mempty) as ReaderMinBox<string, ListBox<number>>
        const result2 = monoid['<>'](value2, monoid.mempty) as ReaderMinBox<string, ListBox<number>>

        t.same(toArray(result1.runReader('12') as ListBox<number>), toArray(value1.runReader('12')))
        t.same(toArray(result2.runReader('12') as ListBox<number>), toArray(value2.runReader('12')))
    })
})
