import tap from 'tap'
import { apply } from 'ghc/base/function-arrow/apply'
import { withKind, FunctionArrowBox } from 'ghc/prim/function-arrow'

tap.test('Function Arrow Apply', async (t) => {
    const A = apply<number>()

    const f = withKind((n: number) => (x: string) => x + '!' + n)
    const v = withKind((n: number) => n.toString())

    const res = A['<*>'](f, v) as FunctionArrowBox<number, string>
    t.equal(res(3), '3!3')

    const thenRes = A['*>'](
        withKind((_: number) => 1),
        withKind((_: number) => 2),
    ) as FunctionArrowBox<number, number>
    t.equal(thenRes(0), 2)

    const leftRes = A['<*'](
        withKind((_: number) => 1),
        withKind((_: number) => 2),
    ) as FunctionArrowBox<number, number>
    t.equal(leftRes(0), 1)

    const flipRes = A['<**>'](
        withKind((_: number) => 5),
        withKind((_: number) => (x: number) => x + 1),
    ) as FunctionArrowBox<number, number>
    t.equal(flipRes(0), 6)
})
