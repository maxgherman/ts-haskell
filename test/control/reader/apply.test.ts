import tap from 'tap'
import { apply } from 'control/reader/apply'
import { reader, ReaderBox } from 'control/reader/reader'

const run = <A>(r: ReaderBox<string, A>, env: string) => r.runReader(env)

tap.test('Reader Apply', async (t) => {
    const A = apply<string>()

    const rf = reader((env: string) => (x: number) => x + env.length)
    const ra = reader((env: string) => env.length)

    const r = A['<*>'](rf, ra) as ReaderBox<string, number>
    t.equal(run(r, 'abc'), 6)

    const rThen = A['*>'](
        ra,
        reader((env: string) => env.toUpperCase()),
    ) as ReaderBox<string, string>
    t.equal(run(rThen, 'ab'), 'AB')

    const rLeft = A['<*'](
        ra,
        reader((env: string) => env.toUpperCase()),
    ) as ReaderBox<string, number>
    t.equal(run(rLeft, 'ab'), 2)

    const rFlip = A['<**>'](ra, rf) as ReaderBox<string, number>
    t.equal(run(rFlip, 'a'), 2)
})
