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
        it('returns concat', () => {
            return monoid.mappend(a, b)
                .then(result => expect(result).toEqual([1, 2, 3, 4, 5, 6]));
        })

        // it('uses mempty for falsy first arg', () => {
        //     const result = monoid.mappend(undefined, [4, 5, 6]);
        //     expect(result).toEqual([4, 5, 6]);
        // }),

        // it('uses mempty for falsy second arg', () => {
        //     const result = monoid.mappend([1, 2, 3], undefined);
        //     expect(result).toEqual([1, 2, 3]);
        // }),

        // it('uses mempty for falsy second arg', () => {
        //     const result = monoid.mappend(undefined, undefined);
        //     expect(result).toEqual([]);
        // })
    });

    describe('mconcat', () => {
        it('flattens right array', () => {
            return monoid.mconcat([a, b])
            .then(result => expect(result).toEqual([1, 2, 3, 4, 5, 6]))
        })

        // it('uses mempty for falsy arg', () => {
        //     const result = monoid.mconcat(undefined);
        //     expect(result).toEqual([]);
        // })
    })
});