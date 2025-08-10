import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { semigroup as createSemigroup } from 'data/either/semigroup'
import { $case, left, right } from 'data/either/either'
import { formList } from 'ghc/base/non-empty/list'
import { cons, nil } from 'ghc/base/list/list'

const semigroup = createSemigroup<Error, string>()

const caseErrorMessage = $case<Error, string, string>({
    left: (error) => error.message,
})
const caseString = $case<Error, string, string>({ right: id })

tap.test('EitherSemigroup', async (t) => {
    t.test('<>', async (t) => {
        const error1 = new Error('error 1')
        const error2 = new Error('error 2')

        const value1 = left<Error, string>(error1)
        const value2 = left<Error, string>(error2)
        const value3 = right<Error, string>('Hello')
        const value4 = right<Error, string>(' world')

        const result1 = semigroup['<>'](value1, value2)
        const result2 = semigroup['<>'](value1, value3)
        const result3 = semigroup['<>'](value4, value2)
        const result4 = semigroup['<>'](value3, value4)

        t.equal(caseErrorMessage(result1), error2.message)
        t.equal(caseString(result2), 'Hello')
        t.equal(caseString(result3), ' world')
        t.equal(caseString(result4), 'Hello')
    })

    t.test('sconcat', async (t) => {
        const value = compose(
            formList,
            cons(right<Error, string>('Hello')),
            cons(right<Error, string>(' ')),
            cons(left<Error, string>(new Error('test error'))),
            cons(right<Error, string>('world')),
            nil,
        )()

        const result = semigroup.sconcat(value)

        t.equal(caseString(result), 'Hello')
    })

    t.test('stimes', async (t) => {
        const result1 = semigroup.stimes(10, left<Error, string>(new Error('test error')))
        const result2 = semigroup.stimes(10, right<Error, string>('Test'))
        const result3 = () => semigroup.stimes(-1, right<Error, string>('Test'))

        t.equal(caseErrorMessage(result1), 'test error')
        t.equal(caseString(result2), 'Test')
        t.throws(result3)
    })

    t.test('semigroup law: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const error1 = left<Error, string>(new Error('error 1'))
        const error2 = left<Error, string>(new Error('error 2'))
        const error3 = left<Error, string>(new Error('error 3'))

        const value1 = right<Error, string>('value 1')
        const value2 = right<Error, string>('value 2')
        const value3 = right<Error, string>('value 3')

        const result1 = semigroup['<>'](semigroup['<>'](error1, error2), error3)
        const result2 = semigroup['<>'](error1, semigroup['<>'](error2, error3))

        const result3 = semigroup['<>'](semigroup['<>'](value1, value2), value3)
        const result4 = semigroup['<>'](value1, semigroup['<>'](value2, value3))

        t.equal(caseErrorMessage(result1), 'error 3')
        t.equal(caseErrorMessage(result2), 'error 3')

        t.equal(caseString(result3), 'value 1')
        t.equal(caseString(result4), 'value 1')
    })
})
