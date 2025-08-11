import tap from 'tap'
import { $case, just, kindOf, nothing } from 'ghc/base/maybe/maybe'

tap.test('Maybe', async (t) => {
    t.test('Nothing constructor', async (t) => {
        const value = nothing<number>()
        const result = value()

        t.equal(result, undefined)
    })

    t.test('Nothing $case', async (t) => {
        const value = nothing<string>()

        const result = $case({
            nothing: () => 123,
            just: (x) => Number(x),
        })(value)

        t.equal(result, 123)
    })

    t.test('Nothing $case missing pattern', async (t) => {
        const value = nothing<string>()

        const result = () =>
            $case({
                just: (x) => `${x} 123`,
            })(value)

        t.throws(() => result())
    })

    t.test('Just constructor', async (t) => {
        const value = just<number>(123)
        const result = value()

        t.equal(result, 123)
    })

    t.test('Just $case', async (t) => {
        const value = just<string>('123')

        const result = $case({
            nothing: () => '0',
            just: (x) => `${x} 123`,
        })(value)

        t.equal(result, '123 123')
    })

    t.test('Just $case missing pattern', async (t) => {
        const value = just<string>('123')

        const result = () =>
            $case({
                nothing: () => '123',
            })(value)

        t.throws(() => result())
    })

    t.test('kind', async (t) => {
        const justValue = just<string>('123')
        const nothingValue = nothing<string>()

        t.equal(kindOf(justValue), '*')
        t.equal(kindOf(nothingValue), '*')

        type Star = '*' & ((_: '*') => '*')
        const star = '*' as Star

        t.equal(justValue.kind(star), '*')
        t.equal(nothingValue.kind(star), '*')
    })
})
