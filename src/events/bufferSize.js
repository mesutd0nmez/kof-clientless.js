import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'

class BufferSize extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_BUFFER_SIZE,
    })
  }

  async recv() {}

  async send() {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)
    packet.writeUnsignedInt(16386)

    this.client.gameSocket.emit('send', packet)
  }
}

export default BufferSize
