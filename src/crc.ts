const CRC_32_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  let byte: number;

  for (let i = 0; i < 256; i++) {
    byte = i;
    for (let b = 0; b < 8; b++) {
      byte = byte & 1 ? (byte >>> 1) ^ 0xedb88320 : byte >>> 1;
    }
    table[i] = byte;
  }

  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (let i = 0; i < data.length; i++) {
    crc = CRC_32_TABLE[(crc & 0xff) ^ data[i]] ^ (crc >>> 8);
  }

  return ~crc;
}
