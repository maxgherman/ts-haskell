import { Writer } from '@data/writer';

describe('Writer', () => {
    const writer = Writer.from([10, ['Test']]);

    it('runWriter', () => {
        expect(writer.runWriter()).toEqual([10, ['Test']]);
    });

    it('execWriter', () => {
        expect(writer.execWriter()).toEqual(['Test']);
    });

    it('mapWriter', () => {
        const action = (pair) => [pair[0] + 1, pair[1].concat('Test 2')];
        expect(writer.mapWriter(action).runWriter()).toEqual([11, ['Test', 'Test 2']]);
    });

    it('runWriter (mapWriter f m) = f (runWriter m)', () => {
        const action = (pair) => [pair[0] + 1, pair[1].concat('Test 2')];

        const result1 = writer.mapWriter(action).runWriter();
        const result2 = action(writer.runWriter());

        expect(result1).toEqual(result2);
        expect(result1).toEqual([11, ['Test', 'Test 2']]);
    });
});