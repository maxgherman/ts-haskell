import tap from 'tap'
import { Func } from 'ghc/base/functions'
import { $case, kindOf, left, right } from 'data/either/either'

tap.test('Either', async (t) => {
    t.test('Left constructor', async (t) => {
        const boxedValue = new Error()

        const value = left<Error, string>(boxedValue)
        const result = value()

        t.equal(result, boxedValue)
    })

    t.test('Left $case', async (t) => {
        const boxedValue = new Error()

        const value = left<Error, string>(boxedValue)

        const result = $case({
            left: (x) => x,
            right: (_: string) => {},
        })(value)

        t.equal(result, boxedValue)
    })

    t.test('Left $case missing pattern', async (t) => {
        const boxedValue = new Error()
        const value = left<Error, string>(boxedValue)

        const result = () =>
            $case({
                right: (_: string) => {},
            })(value)

        t.throws(() => result())
    })

    t.test('Right constructor', async (t) => {
        const boxedValue = 123

        const value = right<Error, number>(boxedValue)
        const result = value()

        t.equal(result, boxedValue)
    })

    t.test('Right $case', async (t) => {
        const boxedValue = 123

        const value = right<Error, number>(boxedValue)

        const result = $case({
            left: () => 0,
            right: (x: number) => x + 1,
        })(value)

        t.equal(result, boxedValue + 1)
    })

    t.test('Right $case missing pattern', async (t) => {
        const boxedValue = 123
        const value = right<string, number>(boxedValue)

        const result = () =>
            $case({
                left: (x: string) => Number(x),
            })(value)

        t.throws(() => result())
    })

    t.test('kind', async (t) => {
        const leftValue = left<Error, string>(new Error())
        const rightValue = right<Error, string>('123')

        t.equal(((kindOf<Error, string>(leftValue) as Func)('*') as Func)('*'), '*')
        t.equal(((kindOf<Error, string>(rightValue) as Func)('*') as Func)('*'), '*')
    })
})
