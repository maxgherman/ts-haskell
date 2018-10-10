import { compose, partial, flip } from 'ramda';
import { monoid } from '@control/monoid/plain-array';

describe('PlainArray monoid', () => {
    describe('mempty', () => {
        it('returns empty array', () => {
            const result = monoid.mempty();
            expect(result).toEqual([]);
        })
    });

    describe('mappend', () => {
        it('returns concat', () => {
            const result = monoid.mappend([1, 2, 3], [4, 5, 6]);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        }),

        it('uses mempty for falsy first arg', () => {
            const result = monoid.mappend(undefined, [4, 5, 6]);
            expect(result).toEqual([4, 5, 6]);
        }),

        it('uses mempty for falsy second arg', () => {
            const result = monoid.mappend([1, 2, 3], undefined);
            expect(result).toEqual([1, 2, 3]);
        }),

        it('uses mempty for falsy second arg', () => {
            const result = monoid.mappend(undefined, undefined);
            expect(result).toEqual([]);
        })
    })

    describe('mconcat', () => {
        it('flattens right array', () => {
            const result = monoid.mconcat([[1, 2, 3], [4, 5, 6]]);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        }),

        it('uses mempty for falsy arg', () => {
            const result = monoid.mconcat(undefined);
            expect(result).toEqual([]);
        })
    })

    describe('Monoid first law (Identity): x <> mempty = x', () => {
        it('non empty array', () => {
            const arg = [1, 2, 3];

            const result = monoid['<>'](arg, monoid.mempty());
            expect(result).toEqual(arg);
        })

        it('empty array', () => {
            const arg = [];

            const result = monoid['<>'](arg, monoid.mempty());
            expect(result).toEqual(arg);
        })
    })

    describe('Monoid second law (Associativity): (a <> b) <> c == a <> (b <> c)', () => {
        it('non empty array', () => {
            const param1 = [1, 2];
            const param2 = [3, 4];
            const param3 = [5, 6];

            const result1 = monoid['<>'](monoid['<>'](param1, param2), param3);
            const result2 = monoid['<>'](param1, monoid['<>'](param2, param3));
            expect(result1).toEqual(result2);
            expect(result1).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('empty array', () => {
            const param1 = [];
            const param2 = [];
            const param3 = [];

            const result1 = monoid['<>'](monoid['<>'](param1, param2), param3);
            const result2 = monoid['<>'](param1, monoid['<>'](param2, param3));
            expect(result1).toEqual(result2);
            expect(result1).toEqual([]);
        })

        it('with compose', () => {
            const param1 = [1, 2];
            const param2 = [3];
            const param3 = [5, 6];

            const result1 = compose(
                partial(flip(monoid['<>']), [param3]),
                partial(monoid['<>'], [param1])
            )(param2);

            const result2 = compose(
                partial(monoid['<>'], [param1]),
                partial(monoid['<>'], [param2])
            )(param3);

            expect(result1).toEqual(result2);
            expect(result1).toEqual([1, 2, 3, 5, 6]);
        })
    })
});