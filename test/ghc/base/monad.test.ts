import tap from 'tap'
import { id } from 'ghc/base/functions'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { monad as listMonad } from 'ghc/base/list/monad'
import { MaybeBox, $case } from 'ghc/base/maybe/maybe'
import { ListBox, toArray } from 'ghc/base/list/list'
import { ap, liftM2 } from 'ghc/base/monad/monad'

const getValue = <A>(box: MaybeBox<A>): A | undefined =>
    $case<A, A | undefined>({
        nothing: () => undefined,
        just: id,
    })(box)

tap.test('Monad', async (t) => {
    t.test('app', async (t) => {
        t.test('Maybe', async (t) => {
            const app = (x: number) => `${x} + 3`
            const result = ap(maybeMonad, maybeMonad.pure(app), maybeMonad.pure(10))

            const value = getValue(result as MaybeBox<string>)

            t.equal(value, '10 + 3')
        })

        t.test('List', async (t) => {
            const app = (x: number) => `${x} + 3`
            const result = ap(listMonad, listMonad.pure(app), listMonad.pure(10))

            const value = toArray(result as ListBox<string>)

            t.same(value, ['10 + 3'])
        })
    })

    t.test('liftM2', async (t) => {
        t.test('Maybe', async (t) => {
            const f = (x1: number) => (x2: number) => `${x1} + ${x2}`
            const result = liftM2(maybeMonad, f, maybeMonad.pure(5), maybeMonad.pure(7))

            const value = getValue(result as MaybeBox<string>)

            t.same(value, '5 + 7')
        })

        t.test('List', async (t) => {
            const f = (x1: number) => (x2: number) => `${x1} + ${x2}`
            const result = liftM2(listMonad, f, listMonad.pure(5), listMonad.pure(7))

            const value = toArray(result as ListBox<string>)

            t.same(value, ['5 + 7'])
        })
    })
})
