import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { semigroup as createSemigroup } from 'ghc/base/maybe/semigroup'
import { $case, just, nothing } from 'ghc/base/maybe/maybe'
import { ListSemigroup, semigroup as createListSemigroup } from 'ghc/base/list/semigroup'
import { cons, ListBox, nil, toArray } from 'ghc/base/list/list'
import { formList } from 'ghc/base/non-empty/list'

const listSemigroup = createListSemigroup<string>()
const semigroup = createSemigroup<ListSemigroup<string>>(listSemigroup)

const caseNothing = $case<ListBox<string>, string>({
    nothing: () => 'nothing',
})

const caseArray = $case<ListBox<string>, string>({
    just: compose((x: string[]) => x.join(''), toArray),
})

const createList = (value: string) => value.split('').reduceRight((acc, curr) => cons(curr)(acc), nil<string>())

tap.test('MaybeSemigroup', async (t) => {
    t.test('<>', async (t) => {
        const list = compose(cons<string>('1'), cons('2'))(nil())
        const result1 = semigroup['<>'](nothing(), nothing())
        const result2 = semigroup['<>'](nothing(), just(list))
        const result3 = semigroup['<>'](just(list), nothing())
        const result4 = semigroup['<>'](just(list), just(list))

        t.equal(caseNothing(result1), 'nothing')
        t.equal(caseArray(result2), '12')
        t.equal(caseArray(result3), '12')
        t.equal(caseArray(result4), '1212')
    })

    t.test('sconcat', async (t) => {
        const value1 = compose(formList, cons(nothing()), nil)()
        const value2 = compose(formList, cons(nothing()), cons(nothing()), nil)(id)

        const value3 = compose(
            formList,
            cons(just(createList('Hello'))),
            cons(just(createList(' '))),
            cons(just(createList('world'))),
            nil,
        )(id)

        const value4 = compose(
            formList,
            cons(nothing()),
            cons(just(createList('Hello'))),
            cons(nothing()),
            cons(just(createList(' world'))),
            cons(nothing()),
            nil,
        )(id)

        const result1 = semigroup.sconcat(value1)
        const result2 = semigroup.sconcat(value2)
        const result3 = semigroup.sconcat(value3)
        const result4 = semigroup.sconcat(value4)

        t.equal(caseNothing(result1), 'nothing')
        t.equal(caseNothing(result2), 'nothing')
        t.equal(caseArray(result3), 'Hello world')
        t.equal(caseArray(result4), 'Hello world')
    })

    t.test('stimes', async (t) => {
        const result1 = semigroup.stimes(10, nothing())
        const result2 = semigroup.stimes(3, just(createList('test ')))
        const result3 = () => semigroup.stimes(-1, just(createList('test')))
        const result4 = semigroup.stimes(0, just(createList('test')))

        t.equal(caseNothing(result1), 'nothing')
        t.equal(caseArray(result2), 'test test test ')
        t.throws(result3)
        t.equal(caseNothing(result4), 'nothing')
    })

    t.test('semigroup law - associativity: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const list1 = just(createList('Hello '))
        const list2 = just(createList('world '))
        const list3 = just(createList('!!!'))

        const result1 = semigroup['<>'](semigroup['<>'](list1, list2), list3)
        const result2 = semigroup['<>'](list1, semigroup['<>'](list2, list3))

        t.equal(caseArray(result1), caseArray(result2))
        t.equal(caseArray(result1), 'Hello world !!!')
    })
})
