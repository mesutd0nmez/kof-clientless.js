import ByteBuffer from 'byte-buffer'
import Iconv from 'iconv-lite'

class KOBuffer extends ByteBuffer {
  constructor(buffer) {
    super(buffer, ByteBuffer.LITTLE_ENDIAN, true)
  }

  readString(doubleByte = false, encoding) {
    let stringLength = 0

    if (doubleByte) stringLength = super.readUnsignedShort()
    else stringLength = super.readByte()

    let output = Buffer.alloc(stringLength)

    if (stringLength > 0) {
      const target = this._index + stringLength

      // Output index
      let i = 0

      while (this._index < target) {
        output[i++] = this._raw[this._index++]
      }
    }

    if (encoding) {
      return Iconv.decode(output, encoding)
    }

    return output.toString(encoding)
  }

  writeString(string, doubleByte = false, encoding) {
    if (doubleByte) super.writeUnsignedShort(string.length)
    else super.writeByte(string.length)

    let output = Buffer.from(string)

    if (encoding) {
      output = Iconv.encode(output, encoding)
    }

    // Output index
    let i = 0

    while (i < output.length) {
      this.writeByte(output[i++])
    }
  }
}

export { KOBuffer as ByteBuffer }
