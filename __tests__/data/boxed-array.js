import { BoxedArray } from '@data/boxed-array';

describe('BoxedArray', () => {
    describe('iterator protocol', () => {
        it('returns empty', () => {
            const data = BoxedArray.empty();
            const iterator = data[Symbol.iterator]();
            const result = iterator.next();

            expect(result.done).toBe(true);
            expect(result.value).toBe(undefined);
        });

        it('returns non empty', () => {
            const data = BoxedArray.from([1, 2, 3]);
            const iterator = data[Symbol.iterator]();

            let result = iterator.next();
            const acc = [];

            while(!result.done) {
                acc.push(result.value);
                result = iterator.next();
            }

            expect(acc).toEqual([1, 2, 3]);
        });

        it('returns spread', () => {
            const data = BoxedArray.from([1, 2, 3]);
            const result = [...data];
            
            expect(result).toEqual([1, 2, 3]);
        });

    });
});