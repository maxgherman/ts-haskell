import tap from 'tap'
import { reader, runReader } from 'control/reader/reader'

tap.test('reader and runReader', async (t) => {
    const run = reader((env: string) => env.length)

    t.equal(run('hello'), 5)
    t.equal(runReader(run, 'world'), 5)
})
