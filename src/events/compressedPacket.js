import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import lzfjs from 'lzfjs'
import Event from '../core/event.js'

class CompressedPacket extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_COMPRESS_PACKET,
    })
  }

  async recv(packet) {
    //input length
    packet.readUnsignedInt()

    var originalLength = packet.readUnsignedInt()

    //CRC always 0 for this reason we don't need to check decompressed data crc
    packet.readUnsignedInt()

    packet = packet.read()

    const deCompressedData = lzfjs.decompress(packet.toArray())

    if (originalLength != deCompressedData.length) {
      console.error(
        'Decompression failed deCompressedData.length != originalLength'
      )
      return
    }

    const deCompressedDataBuffer = new Uint8Array(deCompressedData)

    packet = new ByteBuffer(deCompressedDataBuffer)

    const packetHeader = packet.readUnsignedByte()

    this.client.recv.emit(packetHeader, packet)
  }
}

export default CompressedPacket
