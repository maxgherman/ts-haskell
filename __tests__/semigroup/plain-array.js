import each from 'jest-each';
import { compose, partial, flip } from 'ramda';
import { semigroup } from '@control/semigroup/plain-array';
import { NonEmpty } from '@data/non-empty';

describe('PlainArray semigroup', () => {
    describe('<>', () => {
        it('returns concat', () => {
            const result = semigroup['<>']([1, 2 ,3], [4, 5, 6]);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        }),

        it('uses plain array for falsy first arg', () => {
            const result = semigroup['<>'](undefined, [4, 5, 6]);
            expect(result).toEqual([4, 5, 6]);
        }),

        it('uses plain array for falsy second arg', () => {
            const result = semigroup['<>']([1, 2, 3], undefined);
            expect(result).toEqual([1, 2, 3]);
        }),

        it('uses plain array for falsy args', () => {
            const result = semigroup['<>'](undefined, undefined);
            expect(result).toEqual([]);
        })  
    });

    describe('sconcat', () => {
        it('returns for single value', () => {
            const nonEmpty = NonEmpty.from([[1]]);
            const result = semigroup.sconcat(nonEmpty);

            expect(result).toEqual([1]);
        });

        it('returns for list', () => {
            const nonEmpty = NonEmpty.from([[1]])[':|']([2])[':|']([3]);
            const result = semigroup.sconcat(nonEmpty);

            expect(result).toEqual([1, 2, 3]);
        });
    });

    describe('stimes', () => {
        each([
            [0],
            [-1]
        ])
        .it('throws', (value) => {
            const action = () => semigroup.stimes(value, [1, 2, 3]);

            expect(action).toThrow('stimes: positive multiplier expected');
        });

        it('returns for single value', () => {
            const result = semigroup.stimes(1, [3]);

            expect(result).toEqual([3]);
        });

        it('returns for list', () => {
            const result = semigroup.stimes(3, [1, 2]);

            expect(result).toEqual([1, 2, 1, 2, 1, 2]);
        });
    });

    describe('Semigroup law (Associativity): (a <> b) <> c == a <> (b <> c)',() => {
        it('non empty array', () => {
            const param1 = [1, 2];
            const param2 = [3, 4];
            const param3 = [5, 6];

            const result1 = semigroup['<>'](semigroup['<>'](param1, param2), param3);
            const result2 = semigroup['<>'](param1, semigroup['<>'](param2, param3));

            expect(result1).toEqual(result2);
            expect(result1).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('empty array', () => {
            const param1 = [];
            const param2 = [];
            const param3 = [];

            const result1 = semigroup['<>'](semigroup['<>'](param1, param2), param3);
            const result2 = semigroup['<>'](param1, semigroup['<>'](param2, param3));

            expect(result1).toEqual(result2);
            expect(result1).toEqual([]);
        })

        it('with compose', () => {
            const param1 = [1, 2];
            const param2 = [3, 4];
            const param3 = [5, 6];

            const result1 = compose(
                partial(flip(semigroup['<>']), [param3]),
                partial(semigroup['<>'], [param1]) 
            )(param2);

            const result2 = compose(
                partial(semigroup['<>'], [param1]),
                partial(semigroup['<>'], [param2])
            )(param3);


            expect(result1).toEqual(result2);
            expect(result1).toEqual([1, 2, 3, 4, 5, 6]);
        })
    });
});