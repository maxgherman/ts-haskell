import tap from 'tap'
import { alternative as makeAlternative, BaseImplementation, __testing } from 'control/alternative/alternative'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import { nil, toArray, ListBox, cons, concat } from 'ghc/base/list/list'
import { MinBox1 } from 'data/kind'
import { applicative as listApplicative } from 'ghc/base/list/applicative'

// Build Alternative over Maybe Applicative using the generic combinators
const base: BaseImplementation = {
    empty: nothing,
    '<|>': <A>(fa: MaybeBox<A>, fb: MaybeBox<A>): MaybeBox<A> =>
        $case<A, MaybeBox<A>>({
            // prefer the left if it is Just
            just: () => fa,
            // otherwise return the right
            nothing: () => fb,
        })(fa),
}

const alt = makeAlternative(base, maybeApplicative)

const fromMaybe = <A>(ma: MaybeBox<A>): A => $case<A, A>({ just: (x) => x })(ma)

tap.test('Alternative (generic) some/many and empty branch', (t) => {
    // some should take exactly one when left-biased and succeed
    const someOne = alt.some(just(7)) as MaybeBox<ListBox<number>>
    t.same(toArray(fromMaybe(someOne)), [7])

    // many should take one (left-biased) when value exists
    const manyOne = alt.many(just(3)) as MaybeBox<ListBox<number>>
    t.same(toArray(fromMaybe(manyOne)), [3])

    // Pass a sentinel that looks like an empty List to hit the $null branch
    const sentinelEmptyList = nil<number>() as unknown as MaybeBox<number>

    const result = alt.some(sentinelEmptyList) as MaybeBox<ListBox<number>>
    // Expect empty (Nothing) from base.empty
    const tag = $case<ListBox<number>, string>({ nothing: () => 'none', just: () => 'some' })(result)
    t.equal(tag, 'none')

    t.end()
})

tap.test('Alternative (generic) lazy branch defers evaluation', (t) => {
    let invoked = 0
    const lazyThunk = () => {
        invoked += 1
        const fn = (() => 42) as MaybeBox<number>
        ;(fn as unknown as { kind: unknown }).kind = 'initial'
        ;(fn as unknown as { prop: number }).prop = 10
        return fn
    }

    const lazy = __testing.defer(lazyThunk)
    t.equal(invoked, 0, 'defer should not evaluate immediately')

    type LazyFn = (() => unknown) & { kind: unknown }
    const lazyFunc = lazy as unknown as LazyFn
    lazyFunc.kind = 'custom'
    t.equal(invoked, 1, 'setter should trigger evaluation once')
    t.equal(lazyFunc.kind, 'custom', 'kind setter forwards to underlying object')

    lazyFunc()
    t.equal(invoked, 1, 'subsequent calls reuse cached value')

    t.end()
})

tap.test('Alternative defer proxies object properties', (t) => {
    let invoked = 0
    const lazy = __testing.defer(() => {
        invoked += 1
        return { value: 5, kind: 'seed' } as unknown as MinBox1<number>
    })

    t.equal(invoked, 0, 'object thunk is not evaluated eagerly')

    type LazyObject = { value: number; kind: string }
    const proxy = lazy as unknown as LazyObject
    proxy.kind = 'custom'
    t.equal(invoked, 1, 'setting property forces evaluation once')
    t.equal(proxy.value, 5, 'getter reflects cached object property')

    proxy.value = 9
    t.equal(proxy.value, 9, 'setter updates cached object property')

    t.end()
})

tap.test('Alternative (generic) list detection guards invalid inputs', (t) => {
    t.notOk(__testing.isListLike(42 as unknown as MaybeBox<number>), 'non-functions are never list-like')

    const bomb = (() => {
        throw new Error('boom')
    }) as unknown as MaybeBox<number>
    t.notOk(__testing.isListLike(bomb), 'failing thunks are treated as non list-like')

    t.end()
})

// Helper to build ListBox from array for readability
const listOf = (...xs: number[]): ListBox<number> => xs.reduceRight((acc, x) => cons(x)(acc), nil<number>())

tap.test('Alternative (generic over List) produces combinations and respects empty', (t) => {
    // Build Alternative over List Applicative
    const listBase: BaseImplementation = { empty: nil, '<|>': concat as unknown as BaseImplementation['<|>'] }

    const altList = makeAlternative(listBase, listApplicative)

    // some with a non-empty list produces lists of length >= 1; take first 4 combinations
    const someList = altList.some(listOf(1, 2)) as unknown as ListBox<ListBox<number>>
    const someFirst4 = toArray(someList)
        .slice(0, 4)
        .map((lst) => toArray(lst as unknown as ListBox<number>))
    // expect [ [1], [2], [1,1], [1,2] ] due to left-bias expanding by length
    t.same(someFirst4, [[1], [2], [1, 1], [1, 2]])

    // many should include [] appended via pure(nil()) at the end of '<|>' chain
    const manyList = altList.many(listOf(1, 2)) as unknown as ListBox<ListBox<number>>
    const manyFirst4 = toArray(manyList)
        .slice(0, 4)
        .map((lst) => toArray(lst as unknown as ListBox<number>))
    t.same(manyFirst4, [[1], [2], [1, 1], [1, 2]])

    // some on empty list hits the guarded branch and returns empty
    const someEmpty = altList.some(nil<number>()) as ListBox<ListBox<number>>
    t.same(toArray(someEmpty), [])

    // many on empty list should return a list containing only the empty list
    const manyEmpty = altList.many(nil<number>()) as ListBox<ListBox<number>>
    const manyEmptyFlattened = toArray(manyEmpty).map((lst) => toArray(lst as ListBox<number>))
    t.same(manyEmptyFlattened, [[]])

    t.end()
})
