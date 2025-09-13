import tap from 'tap'
import { product, getProduct, semigroup as productSemigroup, monoid as productMonoid } from 'data/monoid/product'
type Star = '*' & ((_: '*') => '*')
const star = '*' as Star

tap.test('Product monoid', async (t) => {
    const s = productSemigroup()
    const m = productMonoid()

    t.equal(getProduct(s['<>'](product(2), product(3)) as unknown as ReturnType<typeof product>), 6)
    t.equal(getProduct(m['<>'](product(1), m.mempty) as unknown as ReturnType<typeof product>), 1)
    t.equal(getProduct(m['<>'](m.mempty, product(7)) as unknown as ReturnType<typeof product>), 7)
    t.equal(product(1).kind(star), '*')
})
