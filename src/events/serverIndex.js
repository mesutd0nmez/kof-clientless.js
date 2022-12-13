import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'

class ServerIndex extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_SERVER_INDEX,
    })
  }

  async recv() {
    this.client.send.emit(PacketHeader.WIZ_GAMESTART, 1)
  }

  async send() {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)

    this.client.socket.emit('send', packet)
  }
}

export default ServerIndex
