import tap from 'tap'
import { alternative as makeAlternative, BaseImplementation } from 'control/alternative/alternative'
import { applicative as eitherApplicative } from 'data/either/applicative'
import { left, right, $case, EitherBox } from 'data/either/either'
import { nil, toArray, ListBox } from 'ghc/base/list/list'

// Build Alternative over Either Applicative using a left-biased success choice:
// - empty = Left("EMPTY")
// - fa <|> fb = if fa is Right then fa else fb (recover from error)
const base: BaseImplementation = {
    empty: <A>() => left<string, A>('EMPTY') as unknown as EitherBox<string, A>,
    '<|>': <A>(fa: EitherBox<string, A>, fb: EitherBox<string, A>): EitherBox<string, A> =>
        $case<string, A, EitherBox<string, A>>({ left: () => fb, right: () => fa })(fa),
}

const alt = makeAlternative(base, eitherApplicative<string>())

tap.test('Alternative over Either (left-biased success)', (t) => {
    // empty
    const emptyRes = alt.empty<number>() as EitherBox<string, number>
    const emptyTag = $case<string, number, string>({ left: (e) => e })(emptyRes)
    t.equal(emptyTag, 'EMPTY')

    // <|> prefers first Right
    const preferLeftRight = alt['<|>'](right<string, number>(7), right<string, number>(9)) as EitherBox<string, number>
    const preferLeftRightVal = $case<string, number, number>({ right: (x) => x })(preferLeftRight)
    t.equal(preferLeftRightVal, 7)

    // <|> recovers from first Left
    const recover = alt['<|>'](left<string, number>('e1'), right<string, number>(42)) as EitherBox<string, number>
    const recoverVal = $case<string, number, number>({ right: (x) => x })(recover)
    t.equal(recoverVal, 42)

    // <|> both Left picks second (by our definition)
    const bothLeft = alt['<|>'](left<string, number>('e1'), left<string, number>('e2')) as EitherBox<string, number>
    const bothLeftTag = $case<string, number, string>({ left: (e) => e })(bothLeft)
    t.equal(bothLeftTag, 'e2')

    // some/many with Right value produce Right ListBox
    const someOne = alt.some(right<string, number>(5)) as EitherBox<string, ListBox<number>>
    const someOneArr = $case<string, ListBox<number>, number[]>({ right: (lst) => toArray(lst) })(someOne)
    t.same(someOneArr, [5])

    const manyOne = alt.many(right<string, number>(3)) as EitherBox<string, ListBox<number>>
    const manyOneArr = $case<string, ListBox<number>, number[]>({ right: (lst) => toArray(lst) })(manyOne)
    t.same(manyOneArr, [3])

    // Force guarded empty branch using sentinel nil cast as Either
    const sentinel = nil<number>() as unknown as EitherBox<string, number>
    const someEmpty = alt.some(sentinel) as EitherBox<string, ListBox<number>>
    const someEmptyTag = $case<string, ListBox<number>, string>({ left: (e) => e })(someEmpty)
    t.equal(someEmptyTag, 'EMPTY')

    t.end()
})
