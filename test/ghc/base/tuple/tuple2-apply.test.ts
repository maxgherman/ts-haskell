import tap from 'tap'
import { apply } from 'ghc/base/tuple/tuple2-apply'
import { monoid as unitMonoid } from 'ghc/base/tuple/unit-monoid'
import { tuple2, fst, snd, Tuple2BoxT, UnitBox, unit } from 'ghc/base/tuple/tuple'

tap.test('Tuple2 Apply', async (t) => {
    const A = apply(unitMonoid)

    const f = tuple2<UnitBox, (x: number) => number>(unit(), (x) => x + 1)
    const a = tuple2<UnitBox, number>(unit(), 2)

    const r = A['<*>'](f as Tuple2BoxT<UnitBox, (x: number) => number>, a as Tuple2BoxT<UnitBox, number>) as Tuple2BoxT<
        UnitBox,
        number
    >
    t.equal(snd(r), 3)

    const rThen = A['*>'](
        a as Tuple2BoxT<UnitBox, number>,
        tuple2(unit(), 5) as Tuple2BoxT<UnitBox, number>,
    ) as Tuple2BoxT<UnitBox, number>
    t.equal(snd(rThen), 5)

    const rLeft = A['<*'](
        a as Tuple2BoxT<UnitBox, number>,
        tuple2(unit(), 5) as Tuple2BoxT<UnitBox, number>,
    ) as Tuple2BoxT<UnitBox, number>
    t.equal(snd(rLeft), 2)

    const rFlip = A['<**>'](
        a as Tuple2BoxT<UnitBox, number>,
        f as Tuple2BoxT<UnitBox, (x: number) => number>,
    ) as Tuple2BoxT<UnitBox, number>
    t.equal(snd(rFlip), 3)

    // Compare structurally, not by reference
    t.same(fst(A['<*>'](f, a) as Tuple2BoxT<UnitBox, number>), unit())
})
