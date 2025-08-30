import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { $case, EitherBox, left, right } from 'data/either/either'
import { bifunctor as eitherBifunctor } from 'data/either/bifunctor'

const bf = eitherBifunctor()
const leftValue = <TL, TR>(x: EitherBox<TL, TR>) => $case<TL, TR, TL>({ left: id })(x)
const rightValue = <TL, TR>(x: EitherBox<TL, TR>) => $case<TL, TR, TR>({ right: id })(x)

tap.test('Either bifunctor', async (t) => {
    t.test('bimap - right', async (t) => {
        const result = compose<[number], EitherBox<string, number>, EitherBox<string, string>, string>(
            rightValue,
            (x) =>
                bf.bimap<string, number, string, string>(
                    (s) => `L:${s}`,
                    (n) => `R:${n * 2}`,
                    x,
                ),
            right,
        )(3)

        t.equal(result, 'R:6')
    })

    t.test('bimap - left', async (t) => {
        const result = compose<[string], EitherBox<string, number>, EitherBox<string, number>, string>(
            leftValue,
            (x) =>
                bf.bimap<string, number, string, number>(
                    (s) => s.toUpperCase(),
                    (n) => n * 2,
                    x,
                ),
            left,
        )('oops')

        t.equal(result, 'OOPS')
    })

    t.test('first', async (t) => {
        const r = compose<[number], EitherBox<number, number>, EitherBox<number, number>, number>(
            rightValue,
            (x) => bf.first<number, number, number>((n) => n + 1, x),
            right,
        )(10)

        const l = compose<[number], EitherBox<number, number>, EitherBox<number, number>, number>(
            leftValue,
            (x) => bf.first<number, number, number>((n) => n + 1, x),
            left,
        )(10)

        t.equal(r, 10)
        t.equal(l, 11)
    })

    t.test('second', async (t) => {
        const r = compose<[number], EitherBox<number, number>, EitherBox<number, number>, number>(
            rightValue,
            (x) => bf.second<number, number, number>((n) => n + 1, x),
            right,
        )(10)

        const l = compose<[number], EitherBox<number, number>, EitherBox<number, number>, number>(
            leftValue,
            (x) => bf.second<number, number, number>((n) => n + 1, x),
            left,
        )(10)

        t.equal(r, 11)
        t.equal(l, 10)
    })
})
