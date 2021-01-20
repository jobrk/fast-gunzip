import zlib from 'zlib';
import {gzip} from '../gzip';
import {gunzip} from '../gunzip';

describe('gunzip', () => {
  test('1 uncompressed block', () => {
    const data = new Uint8Array(
      Buffer.from('The quick brown fox jumps over the lazy dog.'),
    );
    const compressed = zlib.gzipSync(data, {level: 0});
    const uncompressed = gunzip(compressed);

    expect(uncompressed).toEqual(data);
  });

  test('1 compressed block with fixed huffman', () => {
    const data = new Uint8Array(
      Buffer.from('The quick brown fox jumps over the lazy dog.'),
    );
    const compressed = zlib.gzipSync(data);
    const uncompressed = gunzip(compressed);

    expect(uncompressed).toEqual(data);
  });

  test('1 compressed block with dynamic huffman', () => {
    const dataArr = [];
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 8; j++) {
        dataArr.push(i);
      }
    }
    const data = new Uint8Array(dataArr);
    const compressed = zlib.gzipSync(data, {level: 9});
    const uncompressed = gunzip(compressed);

    expect(uncompressed).toEqual(data);
  });
});

describe('gzip', () => {
  test('1', () => {
    const data = new Uint8Array(
      Buffer.from('The quick brown fox jumps over the lazy dog.'),
    );
    const compressed = gzip(data);
    const uncompressed = new Uint8Array(zlib.gunzipSync(compressed));

    expect(uncompressed).toEqual(data);
  });
});
