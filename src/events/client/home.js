import PacketHeader from '../../core/enums/packetHeader.js'
import { ByteBuffer } from '../../core/utils/byteBuffer.js'
import Event from '../../core/event.js'

class Home extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_HOME,
    })
  }

  async recv() {}

  async send() {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header.WIZ_HOME)

    this.client.gameSocket.emit('send', packet)
  }
}

export default Home
