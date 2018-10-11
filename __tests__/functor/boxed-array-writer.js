import { identity, partial, compose } from 'ramda';
import { BoxedArray } from '@data/boxed-array';
import { functor as baseFunctor } from '@control/functor/writer';
import { monoid } from '@control/monoid/boxed-array';
import { Writer } from '@data/writer';

describe('PlainArray Writer functor', () => {
    
    const functor = baseFunctor(monoid);
    
    describe('fmap', () => {
        const writer = Writer.from([ 10, BoxedArray.from(['Test']) ]);

        it('maps over', () => {
            const transformer = (x) => x + x/2;
            const result = functor.fmap(transformer, writer);
        
            const [ value, log ] = result.runWriter(); 
            expect(value).toBe(15);
            expect(log.value).toEqual(['Test']);
        });

        it('uses id for falsy transformer paramter', () => {
            const result = functor.fmap(undefined, writer);
            const [ value, log ] = result.runWriter(); 
            
            expect(value).toBe(10);
            expect(log.value).toEqual(['Test']);
      	});

        it('uses mempty for falsy second paramter', () => {
			const result = functor.fmap(undefined, undefined);
            const [ value, log ] = result.runWriter();

            expect(value).toBe(undefined);
            expect(log.value).toEqual([]);
       });
    });

    describe('extensions', () => {
        const writer = Writer.from([ 10, BoxedArray.from(['Test']) ]);
        
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;

            const result = functor['<$>'](transformer, writer);
            const [ value, log ] = result.runWriter();

            expect(value).toBe(105);
            expect(log.value).toEqual(['Test']);
        });

        it('<$', () => {
            const result = functor['<$'](7, writer);
            const [ value, log ] = result.runWriter();

            expect(value).toBe(7);
            expect(log.value).toEqual(['Test']);
        });

        it('$>', () => {
            const result = functor['$>'](writer, 7);
            const [ value, log ] = result.runWriter();

            expect(value).toBe(7);
            expect(log.value).toEqual(['Test']);
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;

            const result = functor['<&>'](writer, transformer);
            const [ value, log ] = result.runWriter();

            expect(value).toBe(105);
            expect(log.value).toEqual(['Test']);
        });
    });

    describe('Functor first law: fmap id = id', () => {
        const fmapId = partial(functor.fmap, [identity]);
		
		it('non empty value', () => {
			const argument = [ 10, BoxedArray.from(['Test']) ];
			const result = fmapId(Writer.from(argument));
		
        	const expected = identity(argument);
		    const [value, log] = result.runWriter();
            
            expect([value, log]).toEqual(expected);
            expect(value).toBe(10);
            expect(log.value).toEqual(['Test']);
		});

        it('empty value', () => {
			const argument = null;
			const result = fmapId(argument);
            
            const [value, log] = result.runWriter();
            const expected = identity([ undefined, BoxedArray.from([]) ]);

            expect([value, log]).toEqual(expected);
      	});
    });

    describe('Functor second law: fmap (f . g) = fmap f . fmap g', () => {
        const a = (x) => x + 2;
		const b = (x) => x * 3;
		const ab = compose(a, b);
		const fA = partial(functor.fmap, [a]);
		const fB = partial(functor.fmap, [b]);
		const fAB = partial(functor.fmap, [ab]);
		const fAfB = compose(fA, fB);

        it('non empty value', () => {
			const argument = Writer.from([ 10, BoxedArray.from(['Test']) ]);
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
            const [ value1, log1 ] = result1.runWriter();
            const [ value2, log2 ] = result2.runWriter();

			expect([ value1, log1 ]).toEqual([ value2, log2 ]);

            // 10 => x * 3 => x + 2 => 35
            expect([ value1, log1.value ]).toEqual([32, ['Test']]);
		});

        it('empty value', () => {
			const argument = null;
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
			
            const [ value1, log1 ] = result1.runWriter();
            const [ value2, log2 ] = result2.runWriter();

            expect([ value1, log1 ]).toEqual([ value2, log2 ]);
			expect([ value1, log1.value ]).toEqual([NaN, []]);
		});
    });
});