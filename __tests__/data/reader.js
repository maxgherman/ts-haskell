import { compose } from 'ramda';
import { Reader } from '@data/reader';

describe('Reader',() => {
    const reader = Reader.from((e) => e + 10);
    
    it('runReader', () => {
        expect(reader.runReader(10)).toBe(20);
    });

    it('runReader (mapReader f m) = f . runReader m', () => {
        const f = (b) => b * 3 + b/2;
        const value = 5;
        
        const result1 = reader.mapReader(f).runReader(value);
        const result2 = compose(f, reader.runReader)(value);
      
        expect(result1).toBe(result2);
        expect(result1).toBe(52.5);
    });

    it('mapReader', () => {
        const mapped = reader.mapReader((a) => a * 3);
        expect(mapped.runReader(10)).toBe(60);
    });

    it('withReader', () => {
        const mapped = reader.withReader((e) => e * 3);
        expect(mapped.runReader(10)).toBe(40);
    });

    it('runReader (withReader f m) = runReader m . f', () => {
        const f = (b) => b * 3 + b/2;
        const value = 5;
        
        const result1 = reader.withReader(f).runReader(value);
        const result2 = compose(reader.runReader, f)(value);

        expect(result1).toBe(result2);
        expect(result1).toBe(27.5);
    });
});