import tap from 'tap'
import { apply } from 'data/either/apply'
import { left, right, $case, EitherBox } from 'data/either/either'

const inspect = <L, R>(e: EitherBox<L, R>) => $case<L, R, string>({ left: (l) => `L:${l}`, right: (r) => `R:${r}` })(e)

tap.test('Either Apply', async (t) => {
    const A = apply<string>()

    const rf = right<string, (x: number) => number>((x) => x + 1)
    const ra = right<string, number>(2)
    const le = left<string, number>('e')

    t.equal(inspect(A['<*>'](rf, ra) as EitherBox<string, number>), 'R:3')
    t.equal(inspect(A['<*>'](rf, le) as EitherBox<string, number>), 'L:e')
    t.equal(inspect(A['<*>'](left('e'), ra) as EitherBox<string, number>), 'L:e')

    t.equal(inspect(A['*>'](ra, right<string, number>(5)) as EitherBox<string, number>), 'R:5')
    t.equal(inspect(A['<*'](ra, right<string, number>(5)) as EitherBox<string, number>), 'R:2')
    t.equal(inspect(A['<**>'](ra, rf) as EitherBox<string, number>), 'R:3')
})
