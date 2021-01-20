import BinaryWriter from './BinaryWriter';
import {crc32} from './crc';

export function gzip(arr: Uint8Array): ArrayBuffer {
  const w = new BinaryWriter();

  writeHeaders(w);
  deflate(w, arr);
  writeTrailers(w, arr);

  return w.getBuffer();
}

//////////////////
// Internal API //
//////////////////

function writeHeaders(w: BinaryWriter): void {
  w.writeBytes([0x1f, 0x8b]);
  w.writeByte(8);
  w.writeBytes([0, 0, 0, 0, 0, 4, 255]);
}

function deflate(w: BinaryWriter, data: Uint8Array): void {
  w.writeByte(1);

  w.writeBits(data.length, 16);
  w.writeBits(~data.length, 16);

  for (let i = 0; i < data.length; i++) {
    w.writeByte(data[i]);
  }
}

function writeTrailers(w: BinaryWriter, data: Uint8Array): void {
  w.writeBits(crc32(data), 32);
  w.writeBits(data.length, 32);
}
