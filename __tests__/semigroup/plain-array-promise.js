import { compose, partial, flip } from 'ramda';
import { semigroup as arraySemigroup } from '@control/semigroup/plain-array';
import { semigroup as promiseSemigroup } from '@control/semigroup/promise';

const semigroup = promiseSemigroup(arraySemigroup);

describe('Promise plain array semigroup', () => {
    const a = Promise.resolve([1, 2, 3]);
    const b = Promise.resolve([4, 5, 6]);

    describe('<>', () => {
        it('returns concat', () => 
            semigroup['<>'](a, b)
            .then((result) => expect(result).toEqual([1, 2, 3, 4, 5, 6]))
        )

        it('uses empty array for falsy first arg', () =>
            semigroup['<>'](undefined, b)
            .then(result => expect(result).toEqual([4, 5, 6]))
        )

        it('uses empty array for falsy promise value (first arg)', () =>
            semigroup['<>'](Promise.resolve(undefined), b)
            .then(result => expect(result).toEqual([4, 5, 6]))
        )

        it('uses empty array for falsy second arg', () =>
            semigroup['<>'](a, undefined)
            .then(result => expect(result).toEqual([1, 2, 3]))
        )

        it('uses empty array for falsy promise value (second arg)', () =>
            semigroup['<>'](a, Promise.resolve(undefined))
            .then(result => expect(result).toEqual([1, 2, 3]))
        )

        it('uses empty array for falsy args', () =>
            semigroup['<>'](undefined, undefined)
            .then(result => expect(result).toEqual([]))
        )
        
        it('uses empty array for falsy promise value args', () =>
            semigroup['<>'](
                new Promise((resolve) => resolve(undefined)),
                new Promise((resolve) => resolve(undefined))
            )
            .then(result => expect(result).toEqual([]))
        )
    });

    describe('Semigroup law (Associativity): (a <> b) <> c == a <> (b <> c)',() => {
        it('non empty array', () => {
            const param1 = Promise.resolve([1, 2]);
            const param2 = Promise.resolve([3, 4]);
            const param3 = Promise.resolve([5, 6]);

            const result1 = semigroup['<>'](semigroup['<>'](param1, param2), param3);
            const result2 = semigroup['<>'](param1, semigroup['<>'](param2, param3));

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

            const result1 = semigroup['<>'](semigroup['<>'](param1, param2), param3);
            const result2 = semigroup['<>'](param1, semigroup['<>'](param2, param3));

            return Promise.all([result1, result2])
                .then(([value1, value2]) => {
                    expect(value1).toEqual(value2);
                    expect(value1).toEqual([]);
                });
        })

        it('with compose', () => {
            const param1 = Promise.resolve([1, 2]);
            const param2 = Promise.resolve([3, 4]);
            const param3 = Promise.resolve([5, 6]);

            const result1 = compose(
                partial(flip(semigroup['<>']), [param3]),
                partial(semigroup['<>'], [param1]) 
            )(param2);

            const result2 = compose(
                partial(semigroup['<>'], [param1]),
                partial(semigroup['<>'], [param2])
            )(param3);

            return Promise.all([result1, result2])
                .then(([value1, value2]) => {
                    expect(value1).toEqual(value2);
                    expect(value1).toEqual([1, 2, 3, 4, 5, 6]);
                });
        })
    });
})