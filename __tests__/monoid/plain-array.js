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
        it('flatters right array', () => {
            const result = monoid.mconcat([[1, 2, 3], [4, 5, 6]]);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        }),

        it('uses mempty for falsy arg', () => {
            const result = monoid.mconcat(undefined);
            expect(result).toEqual([]);
        })
    })
});