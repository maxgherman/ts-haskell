import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { functor as createFunctor } from 'ghc/base/function-arrow/functor'
import { FunctionArrowBox, withKind } from 'ghc/prim/function-arrow'

const functor = createFunctor<number>()
const add1Arrow = withKind((x: number) => x.toString() + '1')

tap.test('FunctionArrowFunctor functor', async (t) => {
    tap.test('fmap', async (t) => {
        const result = functor.fmap((x: string) => x + '0', add1Arrow)

        t.equal(result(124), '12410')
    })

    tap.test('<$>', async (t) => {
        const result = functor['<$>']((x: string) => x + '-', add1Arrow)
        t.equal(result(123), '1231-')
    })

    tap.test('<$', async (t) => {
        const result = functor['<$']('--', add1Arrow)
        t.equal(result(123), '--')
    })

    tap.test('$>', async (t) => {
        const result = functor['$>'](add1Arrow, '--')
        t.equal(result(123), '--')
    })

    tap.test('<&>', async (t) => {
        const result = functor['<&>'](add1Arrow, (x: string) => x + '---')
        t.equal(result(123), '1231---')
    })

    tap.test('void', async (t) => {
        const result = functor.void(add1Arrow)
        t.same(result(123), [])
    })

    t.test('Functor first law: fmap id = id', async (t) => {
        const fmapId = (fa: FunctionArrowBox<number, string>) => functor.fmap(id, fa)

        const result = fmapId(add1Arrow)
        const expected = id(add1Arrow)

        t.equal(result(123), '1231')
        t.equal(result(123), expected(123))
    })

    tap.test('Functor second law: fmap (f . g) = fmap f . fmap g', async (t) => {
        const a = (x: string) => x + x
        const b = (x: string) => x.slice(2, 4)
        const ab = compose(a, b)
        const fA = (fa: FunctionArrowBox<number, string>) => functor.fmap(a, fa)
        const fB = (fb: FunctionArrowBox<number, string>) => functor.fmap(b, fb)
        const fAB = (fab: FunctionArrowBox<number, string>) => functor.fmap(ab, fab)
        const fAfB = compose(fA, fB)

        const one = fAB(add1Arrow)
        const two = fAfB(add1Arrow)

        t.equal(one(123), '3131')
        t.equal(two(123), one(123))
    })
})
