import tap from 'tap'
import { reader, runReader } from 'control/reader/reader'

tap.test('reader and runReader', async (t) => {
    const run = reader((env: string) => env.length)

    t.equal(run.runReader('hello'), 5)
    t.equal(runReader(run, 'world'), 5)
    t.equal(run.kind('*')('*'), '*')
})
