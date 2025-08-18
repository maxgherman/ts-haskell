import tap from 'tap'
import { comonadApply } from 'ghc/base/non-empty/comonad-apply'
import { formList, NonEmptyBox, toList } from 'ghc/base/non-empty/list'
import { cons as listCons, ListBox, nil, toArray } from 'ghc/base/list/list'

const ca = comonadApply

const createList = (value: any[]): ListBox<any> => value.reduceRight((acc, curr) => listCons(curr)(acc), nil())

const createNonEmpty = <T>(value: T[]): NonEmptyBox<T> => formList(createList(value))

tap.test('NonEmpty ComonadApply', async (t) => {
    t.test('<@>', async (t) => {
        const wf = createNonEmpty<(_: number) => number>([
            (x) => x + 1,
            (x) => x + 2,
            (x) => x + 3,
        ])
        const wa = createNonEmpty([1, 2, 3])
        const result = ca['<@>'](wf, wa)
        t.same(toArray(toList(result)), [2, 4, 6])
    })

    t.test('<@@>', async (t) => {
        const wa = createNonEmpty([1, 2, 3])
        const wf = createNonEmpty<(_: number) => number>([
            (x) => x + 1,
            (x) => x + 2,
            (x) => x + 3,
        ])
        const result = ca['<@@>'](wa, wf)
        t.same(toArray(toList(result)), [2, 4, 6])
    })

    t.test('liftW2', async (t) => {
        const wa = createNonEmpty([1, 2, 3])
        const wb = createNonEmpty([4, 5, 6])
        const result = ca.liftW2((a: number) => (b: number) => a + b, wa, wb)
        t.same(toArray(toList(result)), [5, 7, 9])
    })

    t.test('liftW3', async (t) => {
        const wa = createNonEmpty([1, 2, 3])
        const wb = createNonEmpty([4, 5, 6])
        const wc = createNonEmpty([7, 8, 9])
        const result = ca.liftW3(
            (a: number) => (b: number) => (c: number) => a + b + c,
            wa,
            wb,
            wc,
        )
        t.same(toArray(toList(result)), [12, 15, 18])
    })
})
