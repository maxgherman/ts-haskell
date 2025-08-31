import tap from 'tap'
import { apply } from 'control/writer/apply'
import { writer, runWriter, WriterBox } from 'control/writer/writer'
import { tuple2 } from 'ghc/base/tuple/tuple'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'

const createList = <T>(values: NonNullable<T>[]): ListBox<T> =>
    values.reduceRight((acc, curr) => cons(curr)(acc), nil<T>())

tap.test('Writer Apply', async (t) => {
    const logMonoid = listMonoid<string>()
    const A = apply(logMonoid)

    const wf = writer(() => tuple2((x: number) => x + 1, createList(['a'])))
    const wa = writer(() => tuple2(3, createList(['b'])))
    const wApply = A['<*>'](
        wf as WriterBox<ListBox<string>, (x: number) => number>,
        wa as WriterBox<ListBox<string>, number>,
    ) as WriterBox<ListBox<string>, number>
    const [v, l] = runWriter(wApply)
    t.equal(v, 4)
    t.same(toArray(l as ListBox<string>), ['a', 'b'])

    const wThen = A['*>'](
        wa as WriterBox<ListBox<string>, number>,
        writer(() => tuple2(5, createList(['c']))) as WriterBox<ListBox<string>, number>,
    ) as WriterBox<ListBox<string>, number>
    const [v2, l2] = runWriter(wThen)
    t.equal(v2, 5)
    t.same(toArray(l2 as ListBox<string>), ['b', 'c'])

    const wLeft = A['<*'](
        wa as WriterBox<ListBox<string>, number>,
        writer(() => tuple2(5, createList(['c']))) as WriterBox<ListBox<string>, number>,
    ) as WriterBox<ListBox<string>, number>
    const [v3, l3] = runWriter(wLeft)
    t.equal(v3, 3)
    t.same(toArray(l3 as ListBox<string>), ['b', 'c'])

    const wFlip = A['<**>'](
        wa as WriterBox<ListBox<string>, number>,
        wf as WriterBox<ListBox<string>, (x: number) => number>,
    ) as WriterBox<ListBox<string>, number>
    const [v4, l4] = runWriter(wFlip)
    t.equal(v4, 4)
    t.same(toArray(l4 as ListBox<string>), ['b', 'a'])
})
