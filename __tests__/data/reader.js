import { Reader } from '@data/reader';

describe('Reader',() => {
    const reader = Reader.from((e) => e + 10);
    
    it('runReader', () => {
        expect(reader.runReader(10)).toBe(20);
    });

    it('mapReader', () => {
        const mapped = reader.mapReader((a) => a * 3);
        expect(mapped.runReader(10)).toBe(60);
    });

    it('withReader', () =>{
        const mapped = reader.withReader((e) => e * 3);
        expect(mapped.runReader(10)).toBe(40);
    })
});