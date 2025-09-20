import tap from 'tap'
import { alternative as makeAlternative, BaseImplementation } from 'control/alternative/alternative'
import { applicative as eitherApplicative } from 'data/either/applicative'
import { left, right, $case, EitherBox } from 'data/either/either'
import { nil, concat, toArray, ListBox } from 'ghc/base/list/list'

// Validation-style Alternative over Either, accumulating errors on the Left using List concatenation.
// - empty = Left([])
// - fa <|> fb =
//     Right x           -> Right x
//     Left e1 <|> Right y -> Right y
//     Left e1 <|> Left e2 -> Left (e1 <> e2)
const base: BaseImplementation = {
    empty: <A>() => left<ListBox<string>, A>(nil<string>()) as unknown as EitherBox<ListBox<string>, A>,
    '<|>': <A>(fa: EitherBox<ListBox<string>, A>, fb: EitherBox<ListBox<string>, A>): EitherBox<ListBox<string>, A> =>
        $case<ListBox<string>, A, EitherBox<ListBox<string>, A>>({
            right: () => fa,
            left: (e1) =>
                $case<ListBox<string>, A, EitherBox<ListBox<string>, A>>({
                    right: () => fb,
                    left: (e2) => left<ListBox<string>, A>(concat(e1, e2)),
                })(fb),
        })(fa),
}

const altValidation = makeAlternative(base, eitherApplicative<ListBox<string>>())

tap.test('Alternative over Either (Validation-style, accumulates Left errors)', (t) => {
    // empty is Left []
    const emptyRes = altValidation.empty<number>() as EitherBox<ListBox<string>, number>
    const emptyArr = $case<ListBox<string>, number, string[]>({ left: (es) => toArray(es) })(emptyRes)
    t.same(emptyArr, [])

    // Prefer first Right
    const firstRight = altValidation['<|>'](
        right<ListBox<string>, number>(1),
        right<ListBox<string>, number>(2),
    ) as EitherBox<ListBox<string>, number>
    const firstRightVal = $case<ListBox<string>, number, number>({ right: (x) => x })(firstRight)
    t.equal(firstRightVal, 1)

    // Recover from Left on the left
    const recover = altValidation['<|>'](
        left<ListBox<string>, number>(nil<string>()),
        right<ListBox<string>, number>(7),
    ) as EitherBox<ListBox<string>, number>
    const recoverVal = $case<ListBox<string>, number, number>({ right: (x) => x })(recover)
    t.equal(recoverVal, 7)

    // Accumulate errors when both sides are Left
    const e1 = left<ListBox<string>, number>(concat(nil<string>(), nil<string>()))
    const e2 = left<ListBox<string>, number>(concat(nil<string>(), nil<string>()))
    const bothLeft = altValidation['<|>'](e1, e2) as EitherBox<ListBox<string>, number>
    const bothLeftArr = $case<ListBox<string>, number, string[]>({ left: (es) => toArray(es) })(bothLeft)
    t.same(bothLeftArr, [])

    // some/many on Right produce Right list
    const someOne = altValidation.some(right<ListBox<string>, number>(3)) as EitherBox<ListBox<string>, ListBox<number>>
    const someOneArr = $case<ListBox<string>, ListBox<number>, number[]>({ right: (xs) => toArray(xs) })(someOne)
    t.same(someOneArr, [3])

    const manyOne = altValidation.many(right<ListBox<string>, number>(5)) as EitherBox<ListBox<string>, ListBox<number>>
    const manyOneArr = $case<ListBox<string>, ListBox<number>, number[]>({ right: (xs) => toArray(xs) })(manyOne)
    t.same(manyOneArr, [5])

    // Sentinel empty branch (use nil cast) yields empty (Left [])
    const sentinel = nil<number>() as unknown as EitherBox<ListBox<string>, number>
    const someEmpty = altValidation.some(sentinel) as EitherBox<ListBox<string>, ListBox<number>>
    const someEmptyArr = $case<ListBox<string>, ListBox<number>, string[]>({ left: (es) => toArray(es) })(someEmpty)
    t.same(someEmptyArr, [])

    t.end()
})
