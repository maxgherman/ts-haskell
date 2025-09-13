import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { cons, nil, toArray, List, ListBox } from 'ghc/base/list/list'
import { monoid as createMonoid } from 'ghc/base/function-arrow/monoid'
import type { FunctionArrowMinBox } from 'ghc/base/function-arrow/semigroup'
import { monoid as innerMonoid } from 'ghc/base/maybe/monoid'
import { $case, MaybeBox, just } from 'ghc/base/maybe/maybe'
import { semigroup } from 'ghc/base/list/semigroup'
import { withKind } from 'ghc/prim/function-arrow'

const baseSemigroup = semigroup<number>()
const baseMonoid = innerMonoid<ListBox<number>>(baseSemigroup)
const monoid = createMonoid<string, MaybeBox<ListBox<number>>>(baseMonoid)

const getValue = (value: FunctionArrowMinBox<string, MaybeBox<ListBox<number>>>, argument: string) => {
    const appliedValue = value(argument) as MaybeBox<ListBox<number>>

    return $case<List<number>, List<number>>({
        nothing: () => nil(),
        just: (x) => x,
    })(appliedValue)
}

tap.test('FunctionArrowMonoid', async (t) => {
    t.test('mempty', async (t) => {
        const result = monoid.mempty('123') as MaybeBox<ListBox<number>>

        const value = $case<ListBox<number>, number[]>({
            nothing: () => [],
            just: (x) => toArray(x),
        })(result)

        t.same(value, [])
    })

    t.test('<>', async (t) => {
        const part1 = (x: string) => just(cons(Number(x) + 1)(nil()))
        const part2 = (x: string) => just(cons(2 * Number(x))(nil()))

        const result = monoid['<>'](withKind(part1), withKind(part2))
        const value = getValue(result, '123')

        t.same(toArray(value), [124, 246])
    })

    t.test('mappend', async (t) => {
        const part1 = (x: string) => {
            const list = Array.from(x).reduceRight((acc, curr) => cons(Number(curr) + 1)(acc), nil<number>())
            return just(list)
        }

        const part2 = (x: string) => {
            const list = Array.from(x).reduceRight((acc, curr) => cons(2 * Number(curr))(acc), nil<number>())
            return just(list)
        }

        const result = monoid['<>'](withKind(part1), withKind(part2))
        const value = getValue(result, '123')

        t.same(toArray(value), [2, 3, 4, 2, 4, 6])
    })

    t.test('mconcat', async (t) => {
        const listParameter = compose(
            cons(withKind((x: string) => just(cons(Number(x) + 1)(nil())))),
            cons(withKind((x: string) => just(cons(2 * Number(x))(nil())))),
        )(nil())

        const result1 = monoid.mconcat(nil())
        const result2 = monoid.mconcat(listParameter)

        t.same(toArray(getValue(result1, '123')), [])
        t.same(toArray(getValue(result2, '123')), [124, 246])
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const part1 = withKind((x: string) => just(cons(Number(x) + 1)(nil())))
        const part2 = withKind((x: string) => just(cons(2 * Number(x))(nil())))
        const part3 = withKind((x: string) => just(cons(Number(x) - 3)(nil())))

        const result1 = monoid['<>'](monoid['<>'](part1, part2), part3)
        const result2 = monoid['<>'](part1, monoid['<>'](part2, part3))

        t.same(toArray(getValue(result1, '123')), [124, 246, 120])
        t.same(toArray(getValue(result1, '123')), toArray(getValue(result2, '123')))
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const part1 = withKind((x: string) => just(cons(Number(x) + 1)(nil())))
        const part2 = withKind((_: string) => just(nil<number>()))

        const result1 = monoid['<>'](monoid.mempty, part1)
        const result2 = monoid['<>'](monoid.mempty, part2)

        t.same(toArray(getValue(result1, '123')), [124])
        t.same(toArray(getValue(result2, '123')), [])
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const part1 = withKind((x: string) => just(cons(Number(x) + 1)(nil())))
        const part2 = withKind((_: string) => just(nil<number>()))

        const result1 = monoid['<>'](part1, monoid.mempty)
        const result2 = monoid['<>'](part2, monoid.mempty)

        t.same(toArray(getValue(result1, '123')), [124])
        t.same(toArray(getValue(result2, '123')), [])
    })

    t.end()
})
