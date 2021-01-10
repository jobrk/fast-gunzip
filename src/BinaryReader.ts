export default class BinaryReader {
  private data: DataView;
  private pos: number;
  private bitPos: number;

  constructor(buffer: ArrayBuffer) {
    this.data = new DataView(buffer);
    this.pos = 0;
    this.bitPos = 0;
  }

  readBit(): number {
    if (this.bitPos === 8) {
      this.bitPos = 0;
      this.pos++;
    }
    const curByte = this.data.getUint8(this.pos);
    const bit = (curByte >>> this.bitPos) & 1;
    this.bitPos++;

    return bit;
  }

  readByte(): number {
    if (this.bitPos > 0) {
      this.bitPos = 0;
      this.pos++;
    }
    const curByte = this.data.getUint8(this.pos);
    this.pos++;
    return curByte;
  }

  readBits(n: number): number {
    let bits = 0;
    for (let i = 0; i < n; i++) {
      bits |= this.readBit() << i;
    }

    return bits;
  }

  readBytes(n: number): number {
    let bytes = 0;
    for (let i = 0; i < n; i++) {
      bytes |= this.readByte() << (i * 8);
    }

    return bytes;
  }
}
