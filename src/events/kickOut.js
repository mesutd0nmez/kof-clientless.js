import PacketHeader from '../core/enums/packetHeader.js'
import Platform from '../core/enums/platform.js'
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

  async send(crc) {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)
    packet.writeString(this.client.account.username, true)

    if (
      this.client.options.platform == Platform.CNKO ||
      this.client.options.platform == Platform.USKO
    ) {
      packet.writeUnsignedInt(crc)
    }

    this.client.gameSocket.emit('send', packet)
  }
}

export default KickOut
