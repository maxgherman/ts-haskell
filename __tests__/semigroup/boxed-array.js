import { compose, partial, flip } from 'ramda';
import { BoxedArray } from '@data/boxed-array';
import { semigroup } from '@control/semigroup/boxed-array';

describe('BoxedArray semigroup', () => {
    describe('<>', () => {
        it('returns concat', () => {
            const result = semigroup['<>'](BoxedArray.from([1, 2 ,3]), BoxedArray.from([4, 5, 6]));
            expect(result.value).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('uses empty array for falsy first arg', () => {
            const result = semigroup['<>'](undefined, BoxedArray.from([4, 5, 6]));
            expect(result.value).toEqual([4, 5, 6]);
        }),

        it('uses empty array for falsy second arg', () => {
            const result = semigroup['<>'](BoxedArray.from([1, 2, 3]), undefined);
            expect(result.value).toEqual([1, 2, 3]);
        }),

        it('uses empty array for falsy args', () => {
            const result = semigroup['<>'](undefined, undefined);
            expect(result.value).toEqual([]);
        })  
    });

    describe('Semigroup law (Associativity): (a <> b) <> c == a <> (b <> c)',() => {
        it('non empty array', () => {
            const param1 = BoxedArray.from([1, 2]);
            const param2 = BoxedArray.from([3, 4]);
            const param3 = BoxedArray.from([5, 6]);

            const result1 = semigroup['<>'](semigroup['<>'](param1, param2), param3);
            const result2 = semigroup['<>'](param1, semigroup['<>'](param2, param3));

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('empty array', () => {
            const param1 = BoxedArray.from([]);
            const param2 = BoxedArray.from([]);
            const param3 = BoxedArray.from([]);

            const result1 = semigroup['<>'](semigroup['<>'](param1, param2), param3);
            const result2 = semigroup['<>'](param1, semigroup['<>'](param2, param3));

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([]);
        })

        it('with compose', () => {
            const param1 = BoxedArray.from([1, 2]);
            const param2 = BoxedArray.from([3, 4]);
            const param3 = BoxedArray.from([5, 6]);

            const result1 = compose(
                partial(flip(semigroup['<>']), [param3]),
                partial(semigroup['<>'], [param1]) 
            )(param2);

            const result2 = compose(
                partial(semigroup['<>'], [param1]),
                partial(semigroup['<>'], [param2])
            )(param3);


            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([1, 2, 3, 4, 5, 6]);
        })
    });
});