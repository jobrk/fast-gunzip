import BinaryWriter from '../BinaryWriter';
import BinaryReader from '../BinaryReader';

describe('BinaryWriter', () => {
  const w = new BinaryWriter();

  w.writeBit(1);
  w.writeBit(0);
  w.writeBit(1);
  w.writeBit(0);

  w.writeByte(4);

  w.writeBits(2, 2);

  w.writeBytes([0x1f, 0x8b]);

  const r = new BinaryReader(w.getBuffer());

  test('writeBit', () => {
    expect(r.readBit()).toBe(1);
    expect(r.readBit()).toBe(0);
    expect(r.readBit()).toBe(1);
    expect(r.readBit()).toBe(0);
  });

  test('writeByte', () => {
    expect(r.readByte()).toBe(4);
  });

  test('writeBits', () => {
    expect(r.readBits(2)).toBe(2);
  });

  test('writeBytes', () => {
    expect(r.readBytes(2)).toBe(0x8b1f);
  });
});
