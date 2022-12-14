import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'

class KickOut extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_KICKOUT,
    })
  }

  async recv(packet) {
    console.info('Kick Out Recv: ' + packet.toHex())
  }

  async send() {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)
    packet.writeString('xzbit3333', true)

    // TODO: Unknown for usko
    packet.writeUnsignedShort(0)
    packet.writeUnsignedShort(0)

    this.client.socket.emit('send', packet)
  }
}

export default KickOut
