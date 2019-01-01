import { dot } from '@common/utils';
import { identity, compose, flip, partial } from 'ramda';
import { applicative } from '@control/applicative/promise';

describe('Promise applicative', () => {
    const a = Promise.resolve([1, 2, 3]);
    const b = Promise.resolve([4, 5, 6]);

    describe('pure', () => {
        it('returns promise', () =>
            applicative.pure(3)
            .then(result => expect(result).toBe(3))
        );

        it('returns promise for falsy arg', () =>
            applicative.pure(undefined)
            .then(result => expect(result).toBe(undefined))
        );
    });

    describe('lift', () => {
        it('returns for valid args', () =>
            applicative.lift(Promise.resolve((x) => x.map(item => item * 3)), a)
            .then(result => expect(result).toEqual([3, 6, 9]))
        );

        it('returns uses promise with id for falsy first arg', () => {
            const result = applicative.lift(undefined, a);

            return Promise.all([result, a])
            .then(([value, expected]) => expect(value).toEqual(expected));
        })

        it('returns uses empty promise for falsy second arg', () =>
            applicative.lift(Promise.resolve(identity), undefined)
            .then(result => expect(result).toBe(undefined))
        );
    });

    describe('extensions', () => {
        it('liftA2',() => {
            const f = (a) => (b) => a.map(x => x + 1).map((x, index) => x * b[index]);

            return applicative.liftA2(f, Promise.resolve([1, 2]), Promise.resolve([4, 5]))
            .then(result => expect(result).toEqual([8, 15]));
        });

        it('*>', () =>
            applicative['*>'](Promise.resolve(a), Promise.resolve(b))
            .then(result => expect(result).toEqual([4, 5, 6]))
        );

        it('<*', () =>
            applicative['<*'](Promise.resolve(a), Promise.resolve(b))
            .then(result => expect(result).toEqual([1, 2, 3]))
        );

        it('<**>', () =>
            applicative['<**>'](Promise.resolve([4, 5]), Promise.resolve((x) => x.map(item => item * 2)))
            .then(result => expect(result).toEqual([8, 10]))
        );

        it('liftA', () =>
            applicative.liftA(Promise.resolve((x) => x.map(item => item * 2)), a)
            .then(result => expect(result).toEqual([2, 4, 6]))
        );

        it('liftA3', () => {
            const f = (a) => (b) => (c) =>
                a.reduce((aacc, ax) =>
                    aacc.concat(b.reduce((bacc, bx) =>
                        bacc.concat(c.map(cx => (ax + 1) * (bx + 1) * (cx + 1))),
                        [])),
                []);
           
            return applicative.liftA3(f, Promise.resolve([1, 2]), Promise.resolve([3]), Promise.resolve([5]))
            .then(result => expect(result).toEqual([48, 72]));
        });
    });

    describe('Applicative first law (Identity): pure id <*> v = v', () => {
        it('non empty promise', () => {
            const arg1 = applicative.pure(identity);
            const arg2 = a;
            const result = applicative.lift(arg1, arg2);

            return Promise.all([result, a])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toEqual([1, 2, 3]);
            });
        });

        it('empty promise', () => {
            const arg1 = applicative.pure(identity);
            const arg2 = Promise.resolve();
            const result = applicative.lift(arg1, arg2);

            return Promise.all([result, arg2])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toEqual(undefined);
            });
        });
    });

    describe('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', () => {
        const f = x => x + 3;
        const x = 7;
        const arg1 = applicative.pure(f);
        const arg2 = applicative.pure(x);

        const result1 = applicative.lift(arg1, arg2);
        const result2 = applicative.pure(f(x));

        return Promise.all([result1, result2])
        .then(([value1, value2]) => {
            expect(value1).toEqual(value2);
            expect(value1).toEqual(10);
        });
    });

    describe('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', () => {
        const y = 7;
        const $y = (f) => f(y); 
        
        it('non empty promise', () => {
            const u = Promise.resolve((x) => x + 1);

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($y);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toEqual(8);
            });
        });

        it('empty promise', () => {
            const u = Promise.resolve();
            const $yExt = (f) => f ? $y(f) : y;

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($yExt);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toEqual(7);
            });
        });
    });

    describe('Application forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', () => {
        const u = Promise.resolve((x) => x.map(item => item + 2));
        const v = Promise.resolve((x) => x.map(item => item * 3));
        const arg1 = applicative.pure(dot);
        
        it('non empty promise', () => {
            const w = a;

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toEqual([5, 8, 11]);
            });
        });
        
        it('empty promise', () => {
            const uExt = (x) => x + 2;
            const vExt = (x) => x * 3;
            const w = Promise.resolve();

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, uExt), vExt), w);
            const result2 = applicative.lift(uExt, applicative.lift(vExt, w));

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toBe(NaN);
            });
        });

        it('with compose', () => {
            const w = Promise.resolve([4, -5, 6]);
            const lift = applicative.lift;
          
            const result1 = compose(
                flip(lift)(w),
                flip(lift)(v),
                partial(lift, [arg1])
            )(u);

            const result2 = compose(
                partial(lift, [u]),
                partial(lift, [v])
            )(w);
            
            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toEqual(value2);
                expect(value1).toEqual([14, -13, 20]);
            });
        });
    });
});