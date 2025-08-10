import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { $case, EitherBox, left, right } from 'data/either/either'
import { functor as eitherF } from 'data/either/functor'

const functor = eitherF<Error>()
const leftValue = <TL, TR>(x: EitherBox<TL, TR>) => $case<TL, TR, TL>({ left: id })(x)
const rightValue = <TL, TR>(x: EitherBox<TL, TR>) => $case<TL, TR, TR>({ right: id })(x)

tap.test('Either functor', async (t) => {
    t.test('fmap - right', async (t) => {
        const result = compose<[number], EitherBox<Error, number>, EitherBox<Error, number>, number>(
            rightValue,
            (x) => functor.fmap((x: number) => x * x + Math.pow(x, 2), x),
            right,
        )(3)

        const expected = compose<[number], EitherBox<Error, number>, number>(rightValue, right)(18)

        t.equal(result, expected)
        t.equal(result, 18)
    })

    t.test('fmap - left', async (t) => {
        const error = new Error('Test')
        const result = compose<[Error], EitherBox<Error, number>, EitherBox<Error, number>, Error>(
            leftValue,
            (x) => functor.fmap((x: number) => x * x + Math.pow(x, 2), x),
            left,
        )(error)

        t.equal(result, error)
    })

    t.test('<$>', async (t) => {
        const result = compose<[number], EitherBox<Error, number>, EitherBox<Error, number>, number>(
            rightValue,
            (x) => functor['<$>']((x: number) => x * x + x / 2, x),
            right,
        )(3)

        t.equal(result, 10.5)
    })

    t.test('<$', async (t) => {
        const result = compose<[number], EitherBox<Error, number>, EitherBox<Error, number>, number>(
            rightValue,
            (x) => functor['<$'](7, x),
            right,
        )(3)

        t.equal(result, 7)
    })

    t.test('$>', async (t) => {
        const result = compose<[number], EitherBox<Error, number>, EitherBox<Error, number>, number>(
            rightValue,
            (x) => functor['$>'](x, 7),
            right,
        )(3)

        t.equal(result, 7)
    })

    t.test('<&>', async (t) => {
        const result = compose<[number], EitherBox<Error, number>, EitherBox<Error, number>, number>(
            rightValue,
            (x) => functor['<&>'](x, (x: number) => x * x + x / 2),
            right,
        )(3)

        t.equal(result, 10.5)
    })

    t.test('void - left', async (t) => {
        const error = new Error('Test')
        const result = compose<[Error], EitherBox<Error, number>, EitherBox<Error, []>, Error>(
            leftValue,
            functor.void,
            left,
        )(error)

        t.equal(result, error)
    })

    t.test('void - right', async (t) => {
        const result = compose<[number], EitherBox<Error, number>, EitherBox<Error, []>, []>(
            rightValue,
            functor.void,
            right,
        )(3)

        t.same(result, [])
    })

    t.test('Functor first law: fmap id = id', async (t) => {
        const fmapId = (fa: EitherBox<Error, number>) => functor.fmap(id, fa)

        t.test('Right', async (t) => {
            const result = compose<[number], EitherBox<Error, number>, EitherBox<Error, number>, number>(
                rightValue,
                fmapId,
                right,
            )(3)

            const expected = compose<[number], EitherBox<Error, number>, EitherBox<Error, number>, number>(
                rightValue,
                id,
                right,
            )(3)

            t.equal(result, 3)
            t.equal(result, expected)
        })

        t.test('Left', async (t) => {
            const error = new Error('Test')
            const result = compose<[Error], EitherBox<Error, number>, EitherBox<Error, number>, Error>(
                leftValue,
                fmapId,
                left,
            )(error)

            const expected = compose<[Error], EitherBox<Error, number>, EitherBox<Error, number>, Error>(
                leftValue,
                id,
                left,
            )(error)

            t.equal(result, error)
            t.equal(expected, result)
        })

        t.test('Functor second law: fmap (f . g) = fmap f . fmap g', async (t) => {
            const a = (x: number) => x + 2
            const b = (x: number) => x * 3
            const ab = compose(a, b)
            const fA = (fa: EitherBox<Error, number>) => functor.fmap(a, fa)
            const fB = (fb: EitherBox<Error, number>) => functor.fmap(b, fb)
            const fAB = (fab: EitherBox<Error, number>) => functor.fmap(ab, fab)
            const fAfB = compose(fA, fB)

            t.test('Right', async (t) => {
                const one = compose<[number], EitherBox<Error, number>, EitherBox<Error, number>, number>(
                    rightValue,
                    fAB,
                    right,
                )(3)

                const two = compose<[number], EitherBox<Error, number>, EitherBox<Error, number>, number>(
                    rightValue,
                    fAfB,
                    right,
                )(3)

                t.equal(one, 11)
                t.equal(two, one)
            })

            t.test('Left', async (t) => {
                const error = new Error('Test Error')
                const one = compose<[Error], EitherBox<Error, number>, EitherBox<Error, number>, Error>(
                    leftValue,
                    fAB,
                    left,
                )(error)

                const two = compose<[Error], EitherBox<Error, number>, EitherBox<Error, number>, Error>(
                    leftValue,
                    fAfB,
                    left,
                )(error)

                t.equal(one, error)
                t.equal(two, one)
            })
        })
    })
})
