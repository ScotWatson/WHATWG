/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// Based on https://infra.spec.whatwg.org/

import * as ErrorHandling from "https://scotwatson.github.io/ErrorHandling/ErrorHandling.mjs";
import * as Memory from "https://scotwatson.github.io/Memory/Memory.mjs";

// Per Section 3.8
export function assert(condition) {
  if (!condition) {
    throw new Error("Assertion Failed; Report issue to document writer.");
  }
}

// Section 4.1: null is an ECMAScript Language type (value)

// Section 4.2: boolean is an ECMAScript Language type (value)

// Per Section 4.3
export class Byte extends Memory.Uint8 {
  constructor() {
    const mem = new Memory.Block(Memory.Uint8.BYTE_LENGTH);
    const view = new Memory.View(mem);
    super(view);
  }
};

export function isAsciiByte(args) {
  let byte;
  if (args instanceof Memory.Uint8) {
    byte = args;
  } else if (ErrorHandling.isBaseObject(args)) {
    byte = args.byte;
  } else {
    return false;
  }
  return (byte.valueOf() < 0x80);
}

// Per Section 4.4
export class ByteSequence extends Memory.DataArray {
  constructor(args) {
    let length;
    if (ErrorHandling.isInteger(args)) {
      length = args;
    } else if (ErrorHandling.isBareObject(args)) {
      if (!(Object.hasOwn(args, "length"))) {
        throw new Error();
      }
      length = args.length;
    } else {
      throw new Error();
    }
    const mem = new Memory.Block(Memory.Uint8.BYTE_LENGTH * length);
    const view = new Memory.View(mem);
    super({
      ElementClass: Uint8,
      memoryView: view,
      length: length,
    });
  }
  toLowercase() {
    let seq = this;
    let newSeq = new ByteSequence(length);
    const seqIter = seq[Symbol.iterator];
    const newSeqIter = newSeq[Symbol.iterator];
    let seqByte = seqIter();
    let newSeqByte = newSeqIter();
    while (!(seqByte.done) && !(newSeqByte.done)) {
      if ((seqByte.value.valueOf() >= 0x41) && (seqByte.value.valueOf() <= 0x5A)) {
        newSeqByte.value.setValue(seqByte.value + 0x20);
      } else {
        newSeqByte.value.setValue(seqByte.value);
      }
    }
    return newSeq;
  }
  toUppercase() {
    let seq = this;
    let newSeq = new ByteSequence(length);
    const seqIter = seq[Symbol.iterator];
    const newSeqIter = newSeq[Symbol.iterator];
    let seqByte = seqIter();
    let newSeqByte = newSeqIter();
    while (!(seqByte.done) && !(newSeqByte.done)) {
      if ((seqByte.value.valueOf() >= 0x61) && (seqByte.value.valueOf() <= 0x7A)) {
        newSeqByte.value.setValue(seqByte.value - 0x20);
      } else {
        newSeqByte.value.setValue(seqByte.value);
      }
    }
    return newSeq;
  }
  isCaseInsensitiveMatch(args) {
    let A = this;
    let B;
    if (args instanceof ByteSequence) {
      B = args;
    } else if (ErrorHandling.isBareObject(args)) {
      if (!(Object.hasOwn(args, "byteSequence"))) {
        throw new Error();
      }
      B = args.byteSequence;
    } else {
      throw new Error();
    }
    return Iterable.equal(byteLowercase(A), byteLowercase(B));
  }
  startsWith(args) {
    let potentialPrefix;
    let input = this;
    if (args instanceof ByteSequence) {
      potentialPrefix = args;
    } else if (ErrorHandling.isBaseObject(args)) {
      if (!(Object.hasOwn(args, "potentialPrefix"))) {
        throw new Error();
      }
      if (!(args.potentialPrefix instanceof ByteSequence)) {
        throw new Error();
      }
      potentialPrefix = args.potentialPrefix;
    } else {
      throw new Error();
    }
    let i = 0;
    while (true) {
      if (i >= potentialPrefix.length) {
        return true;
      }
      if (i >= input.length) {
        return false;
      }
      let potentialPrefixByte = potentialPrefix.at(i);
      let inputByte = input.at(i);
      if (potentialPrefixByte.valueOf() === inputByte.valueOf()) {
        return false;
      }
      ++i;
    }
  }
  lessThan(args) {
    let a = this;
    let b;
    if (a.startsWith(b)) {
      return false;
    }
    if (b.startsWith(a)) {
      return true;
    }
    let n = 0;
    while (a.at(n) === b.at(n)) {
      ++n;
    }
    if (a.at(n) < b.at(n)) {
      return true;
    }
    return false;
  }
  isomorphicDecode() {
    let input = this;
    let ret = "";
    for (const byte of input) {
      ret += String.fromCharCode(byte.valueOf());
    }
    return ret;
  }
};
