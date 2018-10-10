import { identity, partial, compose } from 'ramda';
import { functor as baseFunctor } from '@control/functor/writer';
import { monoid } from '@control/monoid/plain-array';
import { Writer } from '@data/writer';

describe('PlainArray Writer functor', () => {
    
    const functor = baseFunctor(monoid);
    
    describe('fmap', () => {
        const writer = Writer.from([10, ['Test']]);

        it('maps over', () => {
            const transformer = (x) => x + x/2;
            const result = functor.fmap(transformer, writer);
        
            expect(result.runWriter()).toEqual([15, ['Test']]);
        });

        it('uses id for falsy transformer paramter', () => {
			const result = functor.fmap(undefined, writer);
			expect(result.runWriter()).toEqual([10, ['Test']]);
		});

        it('uses mempty for falsy second paramter', () => {
			const result = functor.fmap(undefined, undefined);
			expect(result.runWriter()).toEqual([undefined, []]);
		});
    });

    describe('extensions', () => {
        const writer = Writer.from([10, ['Test']]);
        
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;

            const result = functor['<$>'](transformer, writer);
            expect(result.runWriter()).toEqual([105, ['Test']]);
            
        });

        it('<$', () => {
            const result = functor['<$'](7, writer);
            expect(result.runWriter()).toEqual([7, ['Test']]);
        });

        it('$>', () => {
            const result = functor['$>'](writer, 7);
            expect(result.runWriter()).toEqual([7, ['Test']]);
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;

            const result = functor['<&>'](writer, transformer);
            expect(result.runWriter()).toEqual([105, ['Test']]);
        });
    });

    describe('Functor first law: fmap id = id', () => {
        const fmapId = partial(functor.fmap, [identity]);
		
		it('non empty value', () => {
			const argument = [10, ['Test']];
			const result = fmapId(Writer.from(argument));
		
        	const expected = identity(argument);
		    const resultValue = result.runWriter();
            
            expect(resultValue).toEqual(expected);
            expect(resultValue).toEqual([10, ['Test']]);
		});

        it('empty value', () => {
			const argument = null;
			const result = fmapId(argument);
			expect(result.runWriter()).toEqual(identity([undefined, []]));
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
			const argument = Writer.from([10, ['Test']]);
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
            const result1Value = result1.runWriter();
            const result2Value = result2.runWriter();

			expect(result1Value).toEqual(result2Value);

            // 10 => x * 3 => x + 2 => 35
            expect(result1Value).toEqual([32, ['Test']]);
		});

        it('empty value', () => {
			const argument = null;
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
			
            const result1Value = result1.runWriter();
            const result2Value = result2.runWriter();

            expect(result1Value).toEqual(result2Value);
			expect(result1Value).toEqual([NaN, []]);
		});
    });
});