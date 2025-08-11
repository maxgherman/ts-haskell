import tap from 'tap'
import { $const, flip, dot, id } from 'ghc/base/functions'

// Tests for basic helper functions

// $const should ignore its second argument
const three = $const(3)

// flip should reverse argument order
const subtract = (a: number, b: number) => a - b
const flipped = flip(subtract)

// dot should compose two functions
const inc = (x: number) => x + 1
const double = (x: number) => x * 2
const composed = dot(double)(inc)

tap.test('basic functions', async (t) => {
    t.equal(id(4), 4)
    t.equal(three('ignored'), 3)
    t.equal(flipped(1, 5), 4)
    t.equal(composed(3), 8)
})
