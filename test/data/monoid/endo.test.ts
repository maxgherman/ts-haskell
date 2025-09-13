import tap from 'tap'
import { endo, appEndo, semigroup as endoSemigroup, monoid as endoMonoid } from 'data/monoid/endo'

tap.test('Endo monoid (composition)', async (t) => {
    const s = endoSemigroup<number>()
    const m = endoMonoid<number>()

    const inc = endo<number>((x) => x + 1)
    const dbl = endo<number>((x) => x * 2)

    const comp = s['<>'](inc, dbl) as unknown as ReturnType<typeof endo<number>>
    t.equal(appEndo(comp, 3), 7) // inc(dbl(3)) = 7

    const idLeft = s['<>'](m.mempty, inc) as unknown as ReturnType<typeof endo<number>>
    t.equal(appEndo(idLeft, 5), 6)

    const idRight = s['<>'](inc, m.mempty) as unknown as ReturnType<typeof endo<number>>
    t.equal(appEndo(idRight, 5), 6)
})
