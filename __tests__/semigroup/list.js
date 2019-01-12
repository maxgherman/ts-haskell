import each from 'jest-each';
import { compose, partial, flip } from 'ramda';
import { List } from '@data/list';
import { semigroup } from '@control/semigroup/list';
import { NonEmpty } from '@data/non-empty';

describe('List semigroup', () => {
    const a = List.empty()[':'](3)[':'](2)[':'](1);
    const b = List.empty()[':'](6)[':'](5)[':'](4);

    describe('<>', () => {
        it('returns concat', () => {
            const result = semigroup['<>'](a, b);
            expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('uses empty list for falsy first arg', () => {
            const result = semigroup['<>'](undefined, b);
            expect(result.toArray()).toEqual([4, 5, 6]);
        })

        it('uses empty list for falsy second arg', () => {
            const result = semigroup['<>'](a, undefined);
            expect(result.toArray()).toEqual([1, 2, 3]);
        })

        it('uses empty list for falsy args', () => {
            const result = semigroup['<>'](undefined, undefined);
            expect(result.toArray()).toEqual([]);
        })  
    });

    describe('sconcat', () => {
        it('returns for single value', () => {
            const nonEmpty = NonEmpty.from([List.single(1)]);
            const result = semigroup.sconcat(nonEmpty);

            expect(result.head).toBe(1);
            expect(result.isSingle).toBe(true);
        });

        it('returns for list', () => {
            const nonEmpty = NonEmpty.from([List.single(1)])
            [':|'](List.single(2))
            [':|'](List.single(3));
            const result = semigroup.sconcat(nonEmpty);

            expect(result.toArray()).toEqual([1, 2, 3]);
        });
    });

    describe('stimes', () => {
        each([
            [0],
            [-1]
        ])
        .it('throws', (value) => {
            const action = () => semigroup.stimes(value, List.single(3));

            expect(action).toThrow('stimes: positive multiplier expected');
        });

        it('returns for single value', () => {
            const result = semigroup.stimes(1, List.single(3));

            expect(result.toArray()).toEqual([3]);
        });

        it('returns for list', () => {
            const result = semigroup.stimes(3, List.single(2)[':'](1));

            expect(result.toArray()).toEqual([1, 2, 1, 2, 1, 2]);
        });
    });

    describe('Semigroup law (Associativity): (a <> b) <> c == a <> (b <> c)',() => {
        const param1 = List.empty()[':'](2)[':'](1);
        const param2 = List.empty()[':'](4)[':'](3);
        const param3 = List.empty()[':'](6)[':'](5);
        
        it('non empty array', () => {
            const result1 = semigroup['<>'](semigroup['<>'](param1, param2), param3);
            const result2 = semigroup['<>'](param1, semigroup['<>'](param2, param3));

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('empty array', () => {
            const param1 = List.empty();
            const param2 = List.empty();
            const param3 = List.empty();

            const result1 = semigroup['<>'](semigroup['<>'](param1, param2), param3);
            const result2 = semigroup['<>'](param1, semigroup['<>'](param2, param3));

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([]);
        })

        it('with compose', () => {
            const result1 = compose(
                partial(flip(semigroup['<>']), [param3]),
                partial(semigroup['<>'], [param1]) 
            )(param2);

            const result2 = compose(
                partial(semigroup['<>'], [param1]),
                partial(semigroup['<>'], [param2])
            )(param3);


            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        })
    });
});
