import { compose, partial, flip } from 'ramda';
import { monoid as plainArrayMonoid } from '@control/monoid/plain-array';
import { monoid as promiseMonoid } from '@control/monoid/promise';

const monoid = promiseMonoid(plainArrayMonoid);

describe('Promise plain array monoid' , () => {
    const a = Promise.resolve([1, 2, 3]);
    const b = Promise.resolve([4, 5, 6]);

    describe('mempty', () => {
        it('returns empty array', () =>
            monoid.mempty()
            .then(result => expect(result).toEqual([]))
        )
    });

    describe('mappend', () => {
        it('returns concat', () =>
            monoid.mappend(a, b)
                .then(result => expect(result).toEqual([1, 2, 3, 4, 5, 6]))
        )

        it('uses mempty for falsy first arg', () =>
            monoid.mappend(undefined, b)
            .then(result => expect(result).toEqual([4, 5, 6]))
        )

        it('uses mempty for falsy second arg', () =>
            monoid.mappend([1, 2, 3], undefined)
            .then(result => expect(result).toEqual([1, 2, 3]))
        )

        it('uses mempty for falsy second arg', () =>
            monoid.mappend(undefined, undefined)
            .then(result => expect(result).toEqual([]))
        )
    });

    describe('mconcat', () => {
        it('flattens right array', () =>
            monoid.mconcat([a, b])
            .then(result => expect(result).toEqual([1, 2, 3, 4, 5, 6]))
        )

        it('uses mempty for falsy arg', () =>
            monoid.mconcat(undefined)
            .then(result => expect(result).toEqual([]))
        )
    });

    describe('Monoid first law (Identity): x <> mempty = x', () => {
        it('non empty array', () =>
            monoid['<>'](a, monoid.mempty())
            .then(result => 
                a.then(initial => expect(result).toEqual(initial))
            )
        )

        it('empty array', () => {
            const arg = Promise.resolve([]);

            return monoid['<>'](arg, monoid.mempty())
            .then(result => 
                arg.then(initial => expect(result).toEqual(initial))
            )
        })
    });

    describe('Monoid second law (Associativity): (a <> b) <> c == a <> (b <> c)', () => {
        it('non empty array', () => {
            const param1 = Promise.resolve([1, 2]);
            const param2 = Promise.resolve([3, 4]);
            const param3 = Promise.resolve([5, 6]);

            const result1 = monoid['<>'](monoid['<>'](param1, param2), param3);
            const result2 = monoid['<>'](param1, monoid['<>'](param2, param3));

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toEqual([1, 2, 3, 4, 5, 6]);
            });
        })

        it('empty array', () => {
            const param1 = Promise.resolve([]);
            const param2 = Promise.resolve([]);
            const param3 = Promise.resolve([]);

            const result1 = monoid['<>'](monoid['<>'](param1, param2), param3);
            const result2 = monoid['<>'](param1, monoid['<>'](param2, param3));
            
            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toEqual([]);
            });
        })

        it('with compose', () => {
            const param1 = Promise.resolve([1, 2]);
            const param2 = Promise.resolve([3]);
            const param3 = Promise.resolve([5, 6]);

            const result1 = compose(
                partial(flip(monoid['<>']), [param3]),
                partial(monoid['<>'], [param1])
            )(param2);

            const result2 = compose(
                partial(monoid['<>'], [param1]),
                partial(monoid['<>'], [param2])
            )(param3);

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toEqual([1, 2, 3, 5, 6]);
            });
        })
    });
});