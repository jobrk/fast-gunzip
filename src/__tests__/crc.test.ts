import {crc32} from '../crc';

describe('crc', () => {
  test('crc32', () => {
    const data = new Uint8Array(
      Buffer.from('The quick brown fox jumps over the lazy dog.'),
    );
    const crc = crc32(data);

    expect(crc).toBe(0x519025e9);
  });
});
