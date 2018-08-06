import { identity, partial, compose } from "ramda";
import { functor as baseFunctor } from '@control/functor/reader';
import { Reader } from '@data/reader';

const functor = baseFunctor();

describe('Reader functor', () => {
    describe('fmap', () => {
        it('maps over', () => {
            const transformer = (x) => x + x/2;
            const result = functor.fmap(transformer, Reader.from((e) => e - 10));
          
            expect(result.runReader(100)).toBe(135);
        });

        it('uses id for falsy transformer paramter', () => {
			const result = functor.fmap(undefined, Reader.from((x) => x + 10));
			expect(result.runReader(100)).toBe(110);
		});

        it('uses id for falsy second paramter', () => {
			const result = functor.fmap(undefined, undefined);
			expect(result.runReader(100)).toBe(100);
		});
    });

    describe('extensions', () => {
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = Reader.from((x) => x + 1);

            const result = functor['<$>'](transformer, argument);
            expect(result.runReader(10)).toBe(126.5);
            
        });

        it('<$', () => {
            const result = functor['<$'](7, Reader.from((x) => x + 1));
            expect(result.runReader(10)).toBe(7);
        });

        it('$>', () => {
            const result = functor['$>'](Reader.from((x) => x + 1), 7);
            expect(result.runReader(10)).toBe(7);
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = (x) => x + 1;

            const result = functor['<&>'](Reader.from(argument), transformer);
            expect(result.runReader(10)).toBe(126.5);
        });
    });

    describe('Functor first law: fmap id = id', () => {
        const fmapId = partial(functor.fmap, [identity]);
		
		it('non empty value', () => {
			const argument = (x) => x + 10;
			const result = fmapId(Reader.from(argument));
			const expected = identity(argument);
			
            const resultValue = result.runReader(10);
            const expectedValue = expected(10);
            
            expect(resultValue).toBe(expectedValue);
            expect(resultValue).toBe(20);
		});
    
        it('empty value', () => {
			const argument = null;
			const result = fmapId(argument);
			expect(result.runReader(10)).toBe(identity(10));
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
			const argument = Reader.from((x) => x + 1);
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
            const result1Value = result1.runReader(10);
            const result2Value = result2.runReader(10);

			expect(result1Value).toBe(result2Value);

            // 10 => x + 1 => x * 3 => x + 2 => 35
            expect(result1Value).toBe(35);
		});

        it('empty value', () => {
			const argument = null;
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
			
            const result1Value = result1.runReader(10);
            const result2Value = result2.runReader(10);

            expect(result1Value).toBe(result2Value);
			expect(result1Value).toBe(32);
		});
    });
});