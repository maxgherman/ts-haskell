import tap from 'tap'
import { reader, runReader, ask, asks, local, mapReader, withReader } from 'control/reader/reader'

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

tap.test('mapReader maps the result of a Reader', async (t) => {
    const computation = asks((env: string) => env.length)
    const mapped = mapReader((n: number) => n * 2, computation)
    t.equal(mapped.runReader('hey'), 6)
})

tap.test('withReader transforms the environment', async (t) => {
    const computation = asks((env: string) => env.length)
    const modified = withReader((n: number) => 'a'.repeat(n), computation)
    t.equal(modified.runReader(4), 4)
})
