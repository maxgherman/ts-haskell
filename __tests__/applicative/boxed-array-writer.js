import { identity, compose, flip, partial } from 'ramda';
import { dot } from '@common/utils';
import { BoxedArray } from '@data/boxed-array';
import { applicative as baseApplicative } from '@control/applicative/writer';
import { monoid } from '@control/monoid/boxed-array';
import { Writer } from '@data/writer';

describe('BoxedArray writer applicative', () => {
    const applicative = baseApplicative(monoid);

    describe('pure', () => {
        it('returns Writer', () => {
            const writer = applicative.pure(123);
            const [data, log] = writer.runWriter();

            expect(data).toBe(123);
            expect(log.value).toEqual([]);
        });

        it('returns Writer for falsy arg', () => {
            const writer = applicative.pure(null);
            const [data, log] = writer.runWriter();

            expect(data).toBe(null);
            expect(log.value).toEqual([]);
        });
    });

    describe('lift', () => {
        it('returns for Writer', () => {
            const arg1 = Writer.from([ (x => x + 10), BoxedArray.from(['Test1']) ]);
            const arg2 = Writer.from([ 1, BoxedArray.from(['Test2']) ]);

            const writer = applicative.lift(arg1, arg2);
            const [data, log] = writer.runWriter();

            expect(data).toBe(11);
            expect(log.value).toEqual(['Test1', 'Test2']);
        });

        it('returns for fmap', () => {
            const arg1 = applicative.fmap((x) => (y) => x + y, Writer.from([1, BoxedArray.from(['Test1']) ]));
            const arg2 = Writer.from([2,  BoxedArray.from(['Test2']) ]);

            const writer = applicative.lift(arg1, arg2);
            const [data, log] = writer.runWriter();

            expect(data).toBe(3);
            expect(log.value).toEqual(['Test1', 'Test2']);
        })

        it('uses identity and mempty for falsy first arg', () => {
            const writer = applicative.lift(undefined, Writer.from([1, BoxedArray.from(['Test1']) ]));
            
            const [data, log] = writer.runWriter();

            expect(data).toBe(1);
            expect(log.value).toEqual(['Test1']);
        });

        it('uses undefined and mempty for falsy second arg', () => {
            const writer = applicative.lift(Writer.from([(x => x + 10), BoxedArray.from(['Test1']) ]), undefined);
            const [data, log] = writer.runWriter();

            expect(data).toBe(NaN);
            expect(log.value).toEqual(['Test1']);
        });
    });

    describe('extensions', () => {
        it('liftA2',() => {
            const f = (a) => (b) => (a + 1) * b;
            const writer = applicative.liftA2(
                f,
                Writer.from([ 1, BoxedArray.from(['Test1']) ]),
                Writer.from([ 2, BoxedArray.from(['Test2']) ])
            );
            
            const [data, log] = writer.runWriter();
            expect(data).toBe(4);
            expect(log.value).toEqual(['Test1', 'Test2']);
        });

        it('*>',() => {
            const writer = applicative['*>'](
                Writer.from([ 1, BoxedArray.from(['Test1']) ]),
                Writer.from([ 2, BoxedArray.from(['Test2']) ]));
            const [data, log] = writer.runWriter();

            expect(data).toBe(2);
            expect(log.value).toEqual(['Test1', 'Test2']);
        });

        it('<*',() => {
            const writer = applicative['<*'](
                Writer.from([ 1, BoxedArray.from(['Test1']) ]),
                Writer.from([ 2, BoxedArray.from(['Test2']) ]));
            
            const [data, log] = writer.runWriter();

            expect(data).toBe(1);
            expect(log.value).toEqual(['Test1', 'Test2']);
        });

        it('<**>', () => {
            const writer = applicative['<**>'](
                Writer.from([ 1, BoxedArray.from(['Test1']) ]),
                Writer.from([(x) => 1 - x, BoxedArray.from(['Test2']) ]));
            const [data, log] = writer.runWriter();

            expect(data).toBe(0);
            expect(log.value).toEqual(['Test1', 'Test2']);
        });

        it('liftA', () => {
            const writer = applicative.liftA(
                (x) => x * 2,
                Writer.from([ 3, BoxedArray.from(['Test1']) ]));
            const [data, log] = writer.runWriter();
            
            expect(data).toBe(6);
            expect(log.value).toEqual(['Test1']);
        });

        it('liftA3', () => {
            const f = (a) => (b) => (c) => (a + 1) * (b + 1) * (c + 1);
            const writer = applicative.liftA3(
                f,
                Writer.from([ 2, BoxedArray.from(['Test1']) ]),
                Writer.from([ 3, BoxedArray.from(['Test2']) ]),
                Writer.from([ 5, BoxedArray.from(['Test3']) ]));

            const [data, log] = writer.runWriter();
            expect(data).toBe(3 * 4 * 6);
            expect(log.value).toEqual(['Test1', 'Test2', 'Test3']);
        });
    });

    describe('Applicative first law (Identity): pure id <*> v = v', () => {
        const arg1 = applicative.pure(identity);
        const arg2 = Writer.from([ 3, BoxedArray.from(['Test']) ]);
        const writer = applicative.lift(arg1, arg2);

        const [data, log] = arg2.runWriter();
        const [resultData, resultLog] = writer.runWriter();

        expect(data).toBe(resultData);
        expect(log.value).toEqual(resultLog.value);
        expect(resultData).toBe(3);
        expect(resultLog.value).toEqual(['Test']);
    });

    describe('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', () => {
        const f = (a) => a + 3;
        const x = 7;
        const arg1 = applicative.pure(f);
        const arg2 = applicative.pure(x);

        const [data1, log1] = applicative.lift(arg1, arg2).runWriter();
        const [data2, log2] = applicative.pure(f(x)).runWriter();

        expect(data1).toBe(data2);
        expect(log1.value).toEqual(log2.value);
        expect(data1).toBe(10);
        expect(log1.value).toEqual([]);
    });

    describe('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', () => {
        const y = 7;
        const $y = (f) => f(y); 
        
        const u = Writer.from([(x) => x + 1, BoxedArray.from(['Test']) ]);

        const arg1 = applicative.pure(y);
        const arg2 = applicative.pure($y);

        const [data1, log1] = applicative.lift(u, arg1).runWriter();
        const [data2, log2] = applicative.lift(arg2, u).runWriter();

        expect(data1).toBe(data2);
        expect(log1.value).toEqual(log2.value);
        expect(data1).toBe(8);
        expect(log1.value).toEqual(['Test']);
    });

    describe('Application forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', () => {
        const u = Writer.from([ (x) => x + 2, BoxedArray.from(['Test1']) ]);
        const v = Writer.from([ (x) => x * 3, BoxedArray.from(['Test2']) ]);
        const arg1 = applicative.pure(dot);
        
        it('plain', () => {
            const w = Writer.from([3, BoxedArray.from(['Test3']) ]);
        
            const [data1, log1] = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w).runWriter();
            const [data2, log2] = applicative.lift(u, applicative.lift(v, w)).runWriter();

            expect(data1).toBe(data2);
            expect(log1.value).toEqual(log2.value);
            expect(data1).toBe(11);
            expect(log1.value).toEqual(['Test1', 'Test2', 'Test3']);
        });

        it('with compose', () => {
            const w = Writer.from([6, BoxedArray.from(['Test1']) ]);
            const lift = applicative.lift;
          
            const [data1, log1] = compose(
                flip(lift)(w),
                flip(lift)(v),
                partial(lift, [arg1])
            )(u).runWriter();

            const [data2, log2] = compose(
                partial(lift, [u]),
                partial(lift, [v])
            )(w).runWriter(); 

            expect(data1).toBe(data2);
            expect(log1.value).toEqual(log2.value);
        });
    });
});