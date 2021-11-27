import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { semigroup as createSemigroup } from 'ghc/base/tuple/tuple2-semigroup'
import { semigroup as createListSemigroup } from 'ghc/base/list/list-semigroup'
import { semigroup as createMaybeSemigroup } from 'ghc/base/maybe/maybe-semigroup'
import { $case as maybeCase, just, MaybeBox } from 'ghc/base/maybe/maybe'
import { cons, ListBox, nil, toArray } from 'ghc/base/list/list'
import { fst, snd, tuple2 } from 'ghc/base/tuple/tuple'
import { formList } from 'ghc/base/non-empty/list'

const listSemigroup = createListSemigroup<number>()
const maybeSemigroup = createMaybeSemigroup(createListSemigroup<string>())
const semigroup = createSemigroup(listSemigroup, maybeSemigroup)

const caseArray = maybeCase<ListBox<string>, string>({
    just: compose((x: string[]) => x.join(''), toArray),
})

const createList = <T>(value: NonNullable<T>[]) => value.reduceRight((acc, curr) => cons(curr)(acc), nil<T>())

tap.test('Tuple2Semigroup', async (t) => {
    t.test('<>', async (t) => {
        const list1 = createList([1, 2])
        const list2 = createList(['3', '4'])
        const list3 = createList([5, 6])
        const list4 = createList(['7', '8'])

        const value1 = tuple2(list1, just(list2))
        const value2 = tuple2(list3, just(list4))
        const result4 = semigroup['<>'](value1, value2)

        t.same(toArray(fst(result4) as ListBox<number>), [1, 2, 5, 6])
        t.equal(caseArray(snd(result4) as MaybeBox<ListBox<string>>), '3478')
    })

    t.test('sconcat', async (t) => {
        const list1 = createList([1, 2])
        const list2 = createList(['3', '4'])

        const value1 = tuple2(list1, just(list2))
        const value2 = tuple2(list1, just(list2))

        const value = compose(formList, cons(value1), cons(value2))(nil())
        const result = semigroup.sconcat(value)

        t.same(toArray(fst(result) as ListBox<number>), [1, 2, 1, 2])
        t.same(caseArray(snd(result) as MaybeBox<ListBox<string>>), '3434')
    })

    t.test('stimes', async (t) => {
        const list1 = createList([1, 2])
        const list2 = createList(['3', '4'])

        const value = tuple2(list1, just(list2))
        const result = semigroup.stimes(3, value)
        const result2 = () => semigroup.stimes(-3, value)

        t.same(toArray(fst(result) as ListBox<number>), [1, 2, 1, 2, 1, 2])
        t.equal(caseArray(snd(result) as MaybeBox<ListBox<string>>), '343434')
        t.throws(result2)
    })

    t.test('semigroup law: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const value1 = tuple2(createList([1, 2]), just(createList(['3', '4'])))
        const value2 = tuple2(createList([5, 6]), just(createList(['7'])))
        const value3 = tuple2(createList([8]), just(createList(['9'])))

        const result1 = semigroup['<>'](semigroup['<>'](value1, value2), value3)
        const result2 = semigroup['<>'](value1, semigroup['<>'](value2, value3))

        t.same(toArray(fst(result1) as ListBox<number>), [1, 2, 5, 6, 8])
        t.equal(caseArray(snd(result1) as MaybeBox<ListBox<string>>), '3479')
        t.same(toArray(fst(result2) as ListBox<number>), [1, 2, 5, 6, 8])
        t.equal(caseArray(snd(result2) as MaybeBox<ListBox<string>>), '3479')
    })
})
