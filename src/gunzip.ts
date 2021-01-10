import type {Tree} from './tree';

import BinaryReader from './BinaryReader';
import {crc32} from './crc';
import {decodeElt, decodeTrees} from './tree';
import {
  LENGTH_FIXED_TREE,
  DISTANCE_FIXED_TREE,
  LENGTH_EXTRA_BITS,
  LENGTH_BASE,
  DISTANCE_EXTRA_BITS,
  DISTANCE_BASE,
} from './defaultTrees';

export function gunzip(arr: Uint8Array | ArrayBuffer): Uint8Array {
  const r = new BinaryReader(arr instanceof ArrayBuffer ? arr : arr.buffer);

  processHeaders(r);
  const data = inflate(r);
  processTrailers(r, data);

  return data;
}

//////////////////
// Internal API //
//////////////////

// Header and trailer processors

function processHeaders(r: BinaryReader): void {
  const id = r.readBytes(2);
  if (id !== 0x8b1f) throw new Error('Wrong id for gzip header');

  const compMethod = r.readByte();
  if (compMethod !== 8) {
    throw new Error('Wrong compression method is gzip header');
  }

  const flags = r.readByte();
  r.readBytes(6); // modification time + extra flags + operating system

  // FEXTRA
  if (flags & 4) {
    const xlen = r.readBytes(2);
    r.readBytes(xlen);
  }

  // FNAME
  if (flags & 8) {
    while (r.readByte() !== 0) {}
  }

  // FCOMMENT
  if (flags & 16) {
    while (r.readByte() !== 0) {}
  }

  // FHCRC
  if (flags & 2) {
    r.readBytes(2);
  }
}

function processTrailers(r: BinaryReader, o: Uint8Array): void {
  if (r.readBytes(4) !== crc32(o)) throw new Error('Invalid crc32');
  if (r.readBytes(4) !== o.length) throw new Error('Invalid length');
}

// Block inflation functions

function inflate(r: BinaryReader): Uint8Array {
  const o: Array<number> = []; // output array;
  let finalBlock = false;

  while (!finalBlock) {
    finalBlock = r.readBit() === 1;
    const blockType = r.readBits(2);

    switch (blockType) {
      case 0:
        inflateNoCompression(r, o);
        break;
      case 1:
        inflateBlock(r, o, LENGTH_FIXED_TREE, DISTANCE_FIXED_TREE);
        break;
      case 2:
        const [lTree, dTree] = decodeTrees(r);
        inflateBlock(r, o, lTree, dTree);
        break;
      default:
        throw new Error('Invalid block type');
    }
  }

  return new Uint8Array(o);
}

function inflateNoCompression(r: BinaryReader, o: Array<number>): void {
  const len = r.readBytes(2);
  if ((len ^ r.readBytes(2)) !== 0xffff) {
    throw new Error(
      "Length different from 1's complement in non compressed block",
    );
  }

  for (let i = 0; i < len; i++) {
    o.push(r.readByte());
  }
}

function inflateBlock(
  r: BinaryReader,
  o: Array<number>,
  lTree: Tree,
  dTree: Tree,
): void {
  for (;;) {
    const cur = decodeElt(r, lTree);

    if (cur <= 255) {
      o.push(cur);
    } else if (cur === 256) {
      return;
    } else {
      const lenId = cur - 257;
      const len = LENGTH_BASE[lenId] + r.readBits(LENGTH_EXTRA_BITS[lenId]);
      const distId = decodeElt(r, dTree);
      const dist =
        DISTANCE_BASE[distId] + r.readBits(DISTANCE_EXTRA_BITS[distId]);

      for (let i = 0; i < len; i++) {
        o.push(o[o.length - dist]);
      }
    }
  }
}
