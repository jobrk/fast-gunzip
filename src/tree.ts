import type BinaryReader from './BinaryReader';
import {CODE_LENGTHS_ELTS} from './defaultTrees';

export type Tree = Array<Tree | number>;

export function insert(
  code: number,
  len: number,
  elt: number,
  node: Tree,
): void {
  for (let i = len - 1; i > 0; i--) {
    // @ts-ignore
    node = node[(code >>> i) & 1] || (node[(code >>> i) & 1] = []);
  }
  node[code & 1] = elt;
}

export function defineTree(lengths: Array<number>): Tree {
  const maxLength = Math.max(...lengths);

  const blCount: Array<number> = [];
  lengths.forEach(l => (blCount[l] = 1 + (blCount[l] || 0)));

  const nextCode = [0, 0];
  for (let i = 2; i <= maxLength; i++) {
    nextCode.push((nextCode[i - 1] + (blCount[i - 1] || 0)) << 1);
  }

  const tree: Tree = [];
  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i];
    if (len != null && len !== 0) {
      insert(nextCode[len], len, i, tree);
      nextCode[len]++;
    }
  }

  return tree;
}

export function decodeElt(r: BinaryReader, t: Tree): number {
  let node: Tree | number = t;
  while (Array.isArray(node)) {
    const bit = r.readBit();
    node = node[bit];
  }

  return node;
}

// returns [lTree, dTree]
export function decodeTrees(r: BinaryReader): [Tree, Tree] {
  const hlit = 257 + r.readBits(5);
  const hdist = 1 + r.readBits(5);
  const hclen = 4 + r.readBits(4);

  const bitsLengthCodeLengths: Array<number> = [];
  for (let i = 0; i < hclen; i++) {
    bitsLengthCodeLengths[CODE_LENGTHS_ELTS[i]] = r.readBits(3);
  }
  for (let i = hclen; i < 19; i++) {
    bitsLengthCodeLengths[CODE_LENGTHS_ELTS[i]] = 0;
  }

  const codeLengthTree = defineTree(bitsLengthCodeLengths);

  const bitsLength: Array<number> = [];

  while (bitsLength.length < hlit + hdist) {
    const cur = decodeElt(r, codeLengthTree);

    if (cur < 16) {
      bitsLength.push(cur);
    } else if (cur === 16) {
      const repeats = 3 + r.readBits(2);
      const lastElt = bitsLength[bitsLength.length - 1];
      for (let r = 0; r < repeats; r++) {
        bitsLength.push(lastElt);
      }
    } else if (cur === 17) {
      const repeats = 3 + r.readBits(3);
      for (let r = 0; r < repeats; r++) {
        bitsLength.push(0);
      }
    } else {
      const repeats = 11 + r.readBits(7);
      for (let r = 0; r < repeats; r++) {
        bitsLength.push(0);
      }
    }
  }

  const lTree = defineTree(bitsLength.slice(0, hlit));
  const dTree = defineTree(bitsLength.slice(hlit));

  return [lTree, dTree];
}
