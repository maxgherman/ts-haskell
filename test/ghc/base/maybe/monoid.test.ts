import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { monoid as createMonoid } from 'ghc/base/maybe/maybe-monoid'
import { MaybeBox, $case as maybeCase, just, nothing } from 'ghc/base/maybe/maybe'
import { FunctionArrowSemigroup, semigroup as createSemigroup } from 'ghc/base/function-arrow/function-arrow-semigroup'
import { FunctionArrowBox } from 'ghc/prim/function-arrow/function-arrow'
import { semigroup as createEitherSemigroup, EitherSemigroup } from 'data/either/either-semigroup'
import { right, left, EitherBox, $case as eitherCase } from 'data/either/either'
import { cons, nil } from 'ghc/base/list/list'

type Arrow = FunctionArrowSemigroup<string, EitherSemigroup<Error, number>>
type ArrowBox = FunctionArrowBox<string, EitherBox<Error, number>>

const innerSemigroup = createEitherSemigroup<Error, number>()
const semigroup = createSemigroup<string, EitherSemigroup<Error, number>>(innerSemigroup)
const monoid = createMonoid<Arrow>(semigroup)

const getMaybeValue = (box: MaybeBox<Arrow>, arrowValue: string): undefined | Error | number =>
    maybeCase<ArrowBox, undefined | Error | number>({
        nothing: () => undefined,
        just: (x) =>
            eitherCase<Error, number, Error | number>({
                left: (x) => x,
                right: (x) => x,
            })(x(arrowValue)),
    })(box)

tap.test('MaybeMonoid', async (t) => {
    t.test('mempty', async (t) => {
        const result = maybeCase({
            nothing: () => undefined,
            just: (x) => x,
        })(monoid.mempty)

        t.equal(result, undefined)
    })

    t.test('<>', async (t) => {
        const par1 = (s: string) => right<Error, number>(Number(s) + 1)
        const par2 = () => right<Error, number>(0)

        const result = monoid['<>'](just(par1), just(par2))
        const value = getMaybeValue(result, '123')

        t.equal(value, 124)
    })

    t.test('mappend', async (t) => {
        const part1 = () => left<Error, number>(new Error('test'))
        const part2 = () => right<Error, number>(0)

        const result = monoid.mappend(just(part1), just(part2))
        const value = getMaybeValue(result, '123')
        t.equal(value, 0)
    })

    t.test('mconcat', async (t) => {
        const part = (s: string) => right<Error, number>(Number(s) + 1)
        const list = compose(cons(just(part)), cons(just(part)), cons(just(part)))(nil())

        const result1 = monoid.mconcat(nil())
        const result2 = monoid.mconcat(list)

        t.equal(getMaybeValue(result1, ''), undefined)
        t.equal(getMaybeValue(result2, '123'), 124)
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const part1 = (s: string) => right<Error, number>(Number(s) + 1)
        const part2 = () => right<Error, number>(0)
        const part3 = (s: string) => right<Error, number>(Number(s) + 10)

        const result1 = monoid['<>'](monoid['<>'](just(part1), just(part2)), just(part2))
        const result2 = monoid['<>'](just(part1), monoid['<>'](just(part2), just(part3)))

        const result3 = monoid.mappend(monoid.mappend(nothing(), nothing()), nothing())
        const result4 = monoid.mappend(nothing(), monoid.mappend(nothing(), nothing()))

        t.equal(getMaybeValue(result1, '123'), getMaybeValue(result2, '123'))
        t.equal(getMaybeValue(result1, '123'), 124)

        t.same(getMaybeValue(result3, '123'), getMaybeValue(result4, '123'))
        t.same(getMaybeValue(result3, '123'), null)
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const part1 = () => left<Error, number>(new Error('test'))
        const part2 = (s: string) => right<Error, number>(Number(s) + 1)

        const result1 = monoid['<>'](monoid.mempty, just(part1))
        const result2 = monoid['<>'](monoid.mempty, just(part2))
        const result3 = monoid['<>'](monoid.mempty, nothing())

        t.same(getMaybeValue(result1, ''), new Error('test'))
        t.equal(getMaybeValue(result2, '123'), 124)
        t.same(getMaybeValue(result3, '123'), null)
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const part1 = () => left<Error, number>(new Error('test'))
        const part2 = (s: string) => right<Error, number>(Number(s) + 1)

        const result1 = monoid['<>'](just(part1), monoid.mempty)
        const result2 = monoid['<>'](just(part2), monoid.mempty)
        const result3 = monoid['<>'](monoid.mempty, nothing())

        t.same(getMaybeValue(result1, ''), new Error('test'))
        t.equal(getMaybeValue(result2, '123'), 124)
        t.same(getMaybeValue(result3, '123'), null)
    })
})
