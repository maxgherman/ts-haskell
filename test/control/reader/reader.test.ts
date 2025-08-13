import tap from 'tap'
import { reader, runReader, ask, asks, local } from 'control/reader/reader'

tap.test('reader and runReader', async (t) => {
    const run = reader((env: string) => env.length)

    t.equal(run.runReader('hello'), 5)
    t.equal(runReader(run, 'world'), 5)
    t.equal(run.kind('*')('*'), '*')
})

tap.test('ask returns the current environment', async (t) => {
    t.same(ask<string>().runReader('hi'), 'hi')
})

tap.test('asks maps the environment', async (t) => {
    const getLength = asks((env: string) => env.length)
    t.equal(getLength.runReader('hello'), 5)
})

tap.test('local runs a Reader under a modified environment', async (t) => {
    const computation = asks((env: string) => env.length)
    const modified = local((env: string) => `${env}!`, computation)
    t.equal(modified.runReader('hi'), 3)
})
