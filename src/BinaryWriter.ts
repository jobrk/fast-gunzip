export default class BinaryWriter {
  // private data: DataView;
  private data: Array<number>;
  private pos: number;
  private bitPos: number;

  constructor() {
    this.data = [];
    this.pos = 0;
    this.bitPos = 0;
  }

  writeBit(bit: number): void {
    if (this.bitPos === 8) {
      this.bitPos = 0;
      this.pos++;
    }
    // const curByte = this.data.getUint8(this.pos);
    const curByte = this.data[this.pos];
    // this.data.setUint8(this.pos, curByte | (bit << this.bitPos));
    this.data[this.pos] = curByte | (bit << this.bitPos);

    this.bitPos++;
  }

  writeBits(bits: number, len: number): void {
    for (let i = 0; i < len; i++) {
      this.writeBit((bits >>> i) & 1);
    }
  }

  writeByte(byte: number): void {
    if (this.bitPos > 0) {
      this.bitPos = 0;
      this.pos++;
    }
    this.data[this.pos] = byte;
    this.pos++;
  }

  writeBytes(bytes: Array<number>): void {
    for (let i = 0; i < bytes.length; i++) {
      this.writeByte(bytes[i]);
    }
  }

  getBuffer(): ArrayBuffer {
    return new Uint8Array(this.data).buffer;
  }
}
