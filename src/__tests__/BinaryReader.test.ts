import BinaryReader from '../BinaryReader';

const array = new Uint8Array([
  0b00000001,
  0b00000100,
  0b00001010,
  0b00000011,
  0b00001000,
]);

describe('BinaryReader', () => {
  const r = new BinaryReader(array.buffer);

  test('readBit', () => {
    const bit1 = r.readBit();
    const bit2 = r.readBit();
    const bit3 = r.readBit();
    const bit4 = r.readBit();

    expect(bit1).toBe(1);
    expect(bit2).toBe(0);
    expect(bit3).toBe(0);
    expect(bit4).toBe(0);
  });

  test('readByte', () => {
    const byte = r.readByte();

    expect(byte).toBe(4);
  });

  test('readBits', () => {
    const bits = r.readBits(4);

    expect(bits).toBe(10);
  });

  test('readByte', () => {
    const byte = r.readBytes(2);

    expect(byte).toBe(2051);
  });
});
