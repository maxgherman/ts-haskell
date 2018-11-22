import { identity, partial, compose } from "ramda";
import { functor } from '@control/functor/promise';

describe('Promise functor', () => {
    const arg = Promise.resolve(10);
  
    describe('fmap', () => {
		it('maps over', () => {
			const transformer = (x) => x * x + x;
            return functor.fmap(transformer, arg)
            .then(result => expect(result).toEqual(110));
		});

		it('uses id for falsy transformer paramter', () => {
			return functor.fmap(undefined, Promise.resolve([1]))
            .then(result => expect(result).toEqual([1]));
		});

		it('uses empty promise for false promise paramter', () => {
			return functor.fmap(undefined, undefined)
            .then(result => expect(result).toBe(undefined));
		});
	});

	describe('extensions', () => {
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;
           
			return functor['<$>'](transformer, arg)
			.then(result => expect(result).toEqual(105))
        });

        it('<$', () =>
			functor['<$'](7, arg)
			.then(result => expect(result).toEqual(7))
        );

        it('$>', () => {
			functor['$>'](arg, 7)
			.then(result => expect(result).toEqual(7))
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;

            functor['<&>'](arg, transformer)
			.then(result => expect(result).toEqual(105))
        });
	});
	
	describe('Functor first law: fmap id = id', () => {
		
		const fmapId = partial(functor.fmap, [identity]);
		
		it('non empty promise', () => {
			const result = fmapId(arg);
			const expected = identity(arg);

			return Promise.all([result, expected])
			.then(([value1, value2]) => {
				expect(value1).toEqual(value2);
				expect(value1).toEqual(10);
			});
		});

		it('empty promise', () => {
			const argument = Promise.resolve();
			const result = fmapId(argument);
			const expected = identity(argument);
			
			return Promise.all([result, expected])
			.then(([value1, value2]) => {
				expect(value1).toEqual(value2);
				expect(value1).toBe(undefined);
			});
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
		
		it('non empty promise', () => {
			const result1 = fAB(arg);
			const result2 = fAfB(arg);

			return Promise.all([result1, result2])
			.then(([value1, value2]) => {
				expect(value1).toEqual(value2);
				expect(value2).toEqual(32);
			});
		});

		it('empty promise', () => {
			const argument = Promise.resolve();
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
			
			return Promise.all([result1, result2])
			.then(([value1, value2]) => {
				expect(value1).toEqual(value2);
				expect(value1).toBe(NaN);
			});
		});		
	});
});
