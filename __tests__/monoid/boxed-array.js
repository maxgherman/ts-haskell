import { compose, partial, flip } from 'ramda';
import { BoxedArray } from '@data/boxed-array';
import { monoid } from '@control/monoid/boxed-array';

describe('BoxedArray monoid', () => {
    describe('mempty', () => {
        it('returns empty array', () => {
            const result = monoid.mempty();
            expect(result.value).toEqual([]);
        })
    });

    describe('mappend', () => {
        it('returns concat', () => {
            const result = monoid.mappend(BoxedArray.from([1, 2, 3]), BoxedArray.from([4, 5, 6]));
            expect(result.value).toEqual([1, 2, 3, 4, 5, 6]);
        }),

        it('uses mempty for falsy first arg', () => {
            const result = monoid.mappend(undefined, BoxedArray.from([4, 5, 6]));
            expect(result.value).toEqual([4, 5, 6]);
        }),

        it('uses mempty for falsy second arg', () => {
            const result = monoid.mappend(BoxedArray.from([1, 2, 3]), undefined);
            expect(result.value).toEqual([1, 2, 3]);
        }),

        it('uses mempty for falsy second arg', () => {
            const result = monoid.mappend(undefined, undefined);
            expect(result.value).toEqual([]);
        })
    });

    describe('mconcat', () => {
        it('flatters right array', () => {
            const result = monoid.mconcat([ BoxedArray.from([1, 2, 3]), BoxedArray.from([4, 5, 6]) ]);
            expect(result.value).toEqual([1, 2, 3, 4, 5, 6]);
        }),

        it('uses mempty for falsy arg', () => {
            const result = monoid.mconcat(undefined);
            expect(result.value).toEqual([]);
        })
    });

    describe('Monoid first law (Identity): x <> mempty = x', () => {
        it('non empty array', () => {
            const arg = BoxedArray.from([1, 2, 3]);

            const result = monoid['<>'](arg, monoid.mempty());
            expect(result.value).toEqual(arg.value);
        })

        it('empty array', () => {
            const arg = BoxedArray.from([]);

            const result = monoid['<>'](arg, monoid.mempty());
            expect(result.value).toEqual(arg.value);
        })
    });

    describe('Monoid second law (Associativity): (a <> b) <> c == a <> (b <> c)', () => {
        it('non empty array', () => {
            const param1 = BoxedArray.from([1, 2]);
            const param2 = BoxedArray.from([3, 4]);
            const param3 = BoxedArray.from([5, 6]);

            const result1 = monoid['<>'](monoid['<>'](param1, param2), param3);
            const result2 = monoid['<>'](param1, monoid['<>'](param2, param3));
            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('empty array', () => {
            const param1 = BoxedArray.from([]);
            const param2 = BoxedArray.from([]);
            const param3 = BoxedArray.from([]);

            const result1 = monoid['<>'](monoid['<>'](param1, param2), param3);
            const result2 = monoid['<>'](param1, monoid['<>'](param2, param3));
            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([]);
        })

        it('with compose', () => {
            const param1 = BoxedArray.from([1, 2]);
            const param2 = BoxedArray.from([3]);
            const param3 = BoxedArray.from([5, 6]);

            const result1 = compose(
                partial(flip(monoid['<>']), [param3]),
                partial(monoid['<>'], [param1])
            )(param2);

            const result2 = compose(
                partial(monoid['<>'], [param1]),
                partial(monoid['<>'], [param2])
            )(param3);

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([1, 2, 3, 5, 6]);
        })
    });
});
