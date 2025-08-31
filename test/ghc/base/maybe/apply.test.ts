import tap from 'tap'
import { apply } from 'ghc/base/maybe/apply'
import { $case as maybeCase, just, nothing, MaybeBox } from 'ghc/base/maybe/maybe'

const inspect = <T>(m: MaybeBox<T>) =>
    maybeCase<T, string>({
        nothing: () => 'N',
        just: (x: T) => `J:${x}`,
    })(m)

tap.test('Maybe Apply', async (t) => {
    const A = apply

    const jf = just<(x: number) => number>((x) => x + 1)
    const ja = just(2)
    const nn = nothing<number>()

    t.equal(inspect(A['<*>'](jf, ja) as MaybeBox<number>), 'J:3')
    t.equal(inspect(A['<*>'](jf, nn) as MaybeBox<number>), 'N')
    t.equal(inspect(A['<*>'](nothing(), ja) as MaybeBox<number>), 'N')

    t.equal(inspect(A['*>'](ja, just(5)) as MaybeBox<number>), 'J:5')
    t.equal(inspect(A['<*'](ja, just(5)) as MaybeBox<number>), 'J:2')
    t.equal(inspect(A['<**>'](ja, jf) as MaybeBox<number>), 'J:3')
})
