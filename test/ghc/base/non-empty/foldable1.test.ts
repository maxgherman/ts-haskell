import tap from 'tap'
import { foldable1 } from 'ghc/base/non-empty/foldable1'
import { fromList } from 'ghc/base/non-empty/list'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { semigroup as listSemigroup } from 'ghc/base/list/semigroup'

const listOfNumbers = (...xs: number[]): ListBox<number> => xs.reduceRight((acc, x) => cons(x)(acc), nil<number>())
const listOfLists = (...xs: ListBox<number>[]): ListBox<ListBox<number>> =>
    xs.reduceRight((acc, x) => cons(x)(acc), nil<ListBox<number>>())

const nonEmptyNumbers = fromList(listOfNumbers(1, 2, 3))

tap.test('foldMap1 concatenates mapped NonEmpty values', (t) => {
    const semigroup = listSemigroup<number>()
    const result = foldable1.foldMap1(
        semigroup,
        (n: number) => listOfNumbers(n) as unknown as import('data/kind').MinBox0<ListBox<number>>,
        nonEmptyNumbers,
    )
    t.same(toArray(result as unknown as ListBox<number>), [1, 2, 3])
    t.end()
})

tap.test('fold1 folds NonEmpty semigroup values directly', (t) => {
    const semigroup = listSemigroup<number>()
    const nonEmptyList = fromList(listOfLists(listOfNumbers(1), listOfNumbers(2), listOfNumbers(3)))

    const result = foldable1.fold1(semigroup, nonEmptyList)
    t.same(toArray(result as unknown as ListBox<number>), [1, 2, 3])
    t.end()
})
