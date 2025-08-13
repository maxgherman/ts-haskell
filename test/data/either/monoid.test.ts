import tap from 'tap'
import { monoid as createEitherMonoid } from 'data/either/monoid'
import { $case, left, right, EitherBox } from 'data/either/either'
import { monoid as createListMonoid } from 'ghc/base/list/monoid'
import { cons, nil, toArray, ListBox, List } from 'ghc/base/list/list'

const listMonoid = createListMonoid<string>()
const monoid = createEitherMonoid<ListBox<string>, number>(listMonoid)

const caseLeft = $case<ListBox<string>, number, string[]>({ left: (l) => toArray(l) })
const caseRight = $case<ListBox<string>, number, number>({ right: (r) => r })

const list = (values: string[]): ListBox<string> => values.reduceRight((acc, curr) => cons(curr)(acc), nil<string>())

tap.test('EitherMonoid', async (t) => {
    t.test('mempty', async (t) => {
        t.same(caseLeft(monoid.mempty as EitherBox<ListBox<string>, number>), [])
    })

    t.test('<>', async (t) => {
        const l1 = left<ListBox<string>, number>(list(['a']))
        const l2 = left<ListBox<string>, number>(list(['b', 'c']))
        const r1 = right<ListBox<string>, number>(1)
        const r2 = right<ListBox<string>, number>(2)

        const result1 = monoid['<>'](l1, l2)
        const result2 = monoid['<>'](l1, r1)
        const result3 = monoid['<>'](r1, l1)
        const result4 = monoid['<>'](r1, r2)

        t.same(caseLeft(result1), ['a', 'b', 'c'])
        t.equal(caseRight(result2), 1)
        t.equal(caseRight(result3), 1)
        t.equal(caseRight(result4), 1)
    })

    t.test('mappend', async (t) => {
        const l = left<ListBox<string>, number>(list(['x']))
        const r = right<ListBox<string>, number>(5)

        const result1 = monoid.mappend(l, monoid.mempty)
        const result2 = monoid.mappend(monoid.mempty, r)

        t.same(caseLeft(result1), ['x'])
        t.equal(caseRight(result2), 5)
    })

    t.test('mconcat', async (t) => {
        const l1 = left<ListBox<string>, number>(list(['a']))
        const l2 = left<ListBox<string>, number>(list(['b']))
        const r1 = right<ListBox<string>, number>(9)

        const values = cons(l2)(cons(r1)(cons(l1)(nil() as List<EitherBox<ListBox<string>, number>>)))
        const result = monoid.mconcat(values as List<EitherBox<ListBox<string>, number>>)
        t.equal(caseRight(result), 9)
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const l1 = left<ListBox<string>, number>(list(['a']))
        const l2 = left<ListBox<string>, number>(list(['b']))
        const l3 = left<ListBox<string>, number>(list(['c']))

        const r1 = right<ListBox<string>, number>(1)
        const r2 = right<ListBox<string>, number>(2)
        const r3 = right<ListBox<string>, number>(3)

        const rl1 = monoid['<>'](monoid['<>'](l1, l2), l3)
        const rl2 = monoid['<>'](l1, monoid['<>'](l2, l3))

        const rr1 = monoid['<>'](monoid['<>'](r1, r2), r3)
        const rr2 = monoid['<>'](r1, monoid['<>'](r2, r3))

        t.same(caseLeft(rl1), ['a', 'b', 'c'])
        t.same(caseLeft(rl2), ['a', 'b', 'c'])
        t.equal(caseRight(rr1), 1)
        t.equal(caseRight(rr2), 1)
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const l = left<ListBox<string>, number>(list(['a']))
        const r = right<ListBox<string>, number>(7)

        const rl = monoid['<>'](monoid.mempty, l)
        const rr = monoid['<>'](monoid.mempty, r)

        t.same(caseLeft(rl), ['a'])
        t.equal(caseRight(rr), 7)
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const l = left<ListBox<string>, number>(list(['a']))
        const r = right<ListBox<string>, number>(7)

        const rl = monoid['<>'](l, monoid.mempty)
        const rr = monoid['<>'](r, monoid.mempty)

        t.same(caseLeft(rl), ['a'])
        t.equal(caseRight(rr), 7)
    })
})
