import { identity, partial, compose } from "ramda";
import { Either } from '@data/either';
import { functor as fFactory } from '@control/functor/either';

const functor = fFactory();

describe('Either functor', () => {
	describe('fmap', () => {
		it('maps over', () => {
			const transformer = (x) => x * x + Math.pow(x, 2);
			const result = functor.fmap(transformer, Either.right(3));
			const expected = Either.right(18);

			expect(result.value).toEqual(expected.value);
			expect(result.value).toBe(18);
		});

		it('uses id for falsy transformer paramter', () => {
			const argument = Either.right(10);
			const result = functor.fmap(undefined, argument);
			const expected = identity(argument);
			expect(result.value).toEqual(expected.value)
			expect(result.value).toEqual(argument.value);
			expect(result.isRight).toBe(true);
		});

		it('uses Right for falsy value paramter', () => {
			const result = functor.fmap(undefined, undefined);
			const expected = identity(Either.right(undefined));
			expect(result.value).toEqual(expected.value);
			expect(result.isRight).toBe(true);
			expect(result.value).toBeUndefined();
		});
	});

	describe('extensions', () => {
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = Either.right(3);

            const result = functor['<$>'](transformer, argument);
            expect(result.value).toEqual(10.5);
            
        });

        it('<$', () => {
            const result = functor['<$'](7, Either.right(3));
            expect(result.value).toEqual(7);
        });

        it('$>', () => {
            const result = functor['$>'](Either.right(3), 7);
            expect(result.value).toEqual(7);
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = Either.right(3);

            const result = functor['<&>'](argument, transformer);
            expect(result.value).toEqual(10.5);
        });
    });

	describe('Functor first law: fmap id = id', () => {
		
		const fmapId = partial(functor.fmap, [identity]);
		
		it('Right', () => {
			const argument = Either.right(3);
			const result = fmapId(argument);
			const expected = identity(argument);
			expect(result.value).toEqual(expected.value);
			expect(result.isRight).toEqual(true);
			expect(result.value).toBe(3);
		});

		it('Left', () => {
			const error = new Error('Test Error');
			const argument = Either.left(error);
			const result = fmapId(argument);
			const expected = identity(argument);
			expect(result.value).toEqual(expected.value);
			expect(result.isLeft).toEqual(true);
			expect(result.value).toBe(error);
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
		
		it('Right', () => {
			const argument = Either.right(3);
			const one = fAB(argument);
			const two = fAfB(argument);
			expect(one.value).toEqual(two.value);
			expect(one.isRight).toBe(true);
			expect(two.isRight).toBe(true);
			expect(one.value).toBe(11);
		});

		it('Left', () => {
			const error = new Error('Test Error');
			const argument = Either.left(error);
			const one = fAB(argument);
			const two = fAfB(argument);
			expect(one.value).toEqual(two.value);
			expect(one.isLeft).toBe(true);
			expect(two.isLeft).toBe(true);
			expect(one.value).toBe(error);
			expect(two.value).toBe(error);
		});
	});
});