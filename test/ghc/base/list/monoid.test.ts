import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { cons, nil, $null, toArray } from 'ghc/base/list/list'
import { monoid as createMonoid } from 'ghc/base/list/monoid'

const monoid = createMonoid<string>()

tap.test('ListMonoid', async (t) => {
    t.test('mempty', async (t) => {
        t.ok($null(monoid.mempty))
    })

    t.test('<>', async (t) => {
        const part1 = compose(cons<string>('1'), cons<string>('2'), cons('3'))(nil())
        const part2 = compose(cons<string>('4'), cons<string>('5'), cons('6'))(nil())
        const part3 = nil<string>()

        const result1 = monoid['<>'](part1, part2)
        const result2 = monoid['<>'](part1, part3)
        const result3 = monoid['<>'](part3, part3)

        t.same(toArray(result1), ['1', '2', '3', '4', '5', '6'])
        t.same(toArray(result2), ['1', '2', '3'])
        t.same(toArray(result3), [])
    })

    t.test('mappend', async (t) => {
        const part1 = compose(cons<string>('1'), cons<string>('2'), cons('3'))(nil())
        const part2 = compose(cons<string>('4'), cons<string>('5'), cons('6'))(nil())
        const part3 = nil<string>()

        const result1 = monoid.mappend(part1, part2)
        const result2 = monoid.mappend(part1, part3)
        const result3 = monoid.mappend(part3, part3)

        t.same(toArray(result1), ['1', '2', '3', '4', '5', '6'])
        t.same(toArray(result2), ['1', '2', '3'])
        t.same(toArray(result3), [])
    })

    t.test('mconcat', async (t) => {
        const part1 = compose(cons<string>('1'), cons('2'))(nil())
        const part2 = compose(cons<string>('3'))(nil())
        const part3 = nil<string>()

        const list = compose(cons(part1), cons(part2), cons(part3))(nil())
        const result1 = monoid.mconcat(list)
        const result2 = monoid.mconcat(nil())

        t.same(toArray(result1), ['1', '2', '3'])
        t.same(toArray(result2), [])
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const part1 = compose(cons<string>('1'), cons('2'))(nil())
        const part2 = compose(cons<string>('3'))(nil())
        const part3 = compose(cons<string>('4'), cons('5'))(nil())

        const result1 = monoid['<>'](monoid['<>'](part1, part2), part3)
        const result2 = monoid['<>'](part1, monoid['<>'](part2, part3))

        t.same(toArray(result1), ['1', '2', '3', '4', '5'])
        t.same(toArray(result1), toArray(result2))
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const part1 = compose(cons<string>('1'), cons('2'))(nil())
        const part2 = nil<string>()

        const result1 = monoid['<>'](monoid.mempty, part1)
        const result2 = monoid['<>'](monoid.mempty, part2)

        t.same(toArray(result1), toArray(part1))
        t.same(toArray(result2), toArray(part2))
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const part1 = compose(cons<string>('1'), cons('2'))(nil())
        const part2 = nil<string>()

        const result1 = monoid['<>'](part1, monoid.mempty)
        const result2 = monoid['<>'](part2, monoid.mempty)

        t.same(toArray(result1), toArray(part1))
        t.same(toArray(result2), toArray(part2))
    })
})
