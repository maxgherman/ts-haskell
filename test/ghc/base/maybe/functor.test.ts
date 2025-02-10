import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { functor } from 'ghc/base/maybe/functor'
import { $case, just, Maybe, MaybeBox, nothing } from 'ghc/base/maybe/maybe'

type FakeNothing = { isNothing: true }

const $just = (maybe: Maybe<number>) => $case({ just: id })(maybe)
const $nothing = (maybe: Maybe<number>) => $case({ nothing: () => ({ isNothing: true } as FakeNothing) })(maybe)
const ofJust = (x: NonNullable<number>) => just(x)

const fmapId = <T>(fa: MaybeBox<T>) => functor.fmap(id, fa)

tap.test('Maybe functor', async (t) => {
    t.test('fmap', async (t) => {
        const result = compose(
            $just,
            (m: MaybeBox<number>) => functor.fmap((x: number) => x * x + Math.pow(x, 2), m),
            ofJust,
        )(3)

        const expected = compose<number, Maybe<number>, number>($just, just)(18)

        t.equal(result, expected)
        t.equal(18, result)
    })

    t.test('<$>', async (t) => {
        const result = compose(
            $just,
            (m: MaybeBox<number>) => functor['<$>']((x: number) => x * x + x / 2, m),
            ofJust,
        )(3)

        t.equal(result, 10.5)
    })

    t.test('<$', async (t) => {
        const result = compose($just, (m: MaybeBox<number>) => functor['<$'](7, m), ofJust)(3)

        t.equal(result, 7)
    })

    t.test('$>', async (t) => {
        const result = compose($just, (m: MaybeBox<number>) => functor['$>'](m, 7), ofJust)(3)

        t.equal(result, 7)
    })

    t.test('<&>', async (t) => {
        const result = compose(
            $just,
            (m: MaybeBox<number>) => functor['<&>'](m, (x: number) => x * x + x / 2),
            ofJust,
        )(3)

        t.equal(result, 10.5)
    })

    t.test('void - Just', async (t) => {
        const result = compose(
            $just,
            functor.void,
            ofJust,
        )(3)

        t.same(result, [])
    })

    t.test('void - Nothing', async (t) => {
        const result = compose<MaybeBox<number>, MaybeBox<[]>, FakeNothing>($nothing, functor.void)(nothing())

        t.ok(result.isNothing)
    })

    t.test('Functor first law: fmap id = id', async (t) => {
        t.test('Just', async (t) => {
            const argument = just(3)
            const result = fmapId(argument)
            const expected = id(argument)

            t.equal($just(result), 3)
            t.equal($just(expected), $just(result))
        })

        t.test('Nothing', async (t) => {
            const argument = nothing()
            const result = fmapId(argument)
            const expected = id(argument)

            t.ok($nothing(expected).isNothing)
            t.ok($nothing(result).isNothing)
        })
    })

    t.test('Functor second law: fmap (f . g) = fmap f . fmap g', async (t) => {
        const a = (x: number) => x + 2
        const b = (x: number) => x * 3
        const ab = compose(a, b)
        const fA = (fa: MaybeBox<number>) => functor.fmap(a, fa)
        const fB = (fb: MaybeBox<number>) => functor.fmap(b, fb)
        const fAB = (fab: MaybeBox<number>) => functor.fmap(ab, fab)
        const fAfB = compose<MaybeBox<number>, MaybeBox<number>, MaybeBox<number>>(fA, fB)

        t.test('Just', async (t) => {
            const argument = just(3)
            const one = fAB(argument)
            const two = fAfB(argument)

            t.equal($just(one), 11)
            t.equal($just(one), $just(two))
        })

        t.test('Nothing', async (t) => {
            const argument = nothing<number>()
            const one = fAB(argument)
            const two = fAfB(argument)

            t.ok($nothing(one).isNothing)
            t.ok($nothing(two).isNothing)
        })
    })
})
