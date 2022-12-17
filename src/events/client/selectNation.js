import PacketHeader from '../../core/enums/packetHeader.js'
import { ByteBuffer } from '../../core/utils/byteBuffer.js'
import Event from '../../core/event.js'

class SelectNation extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_SEL_NATION,
    })
  }

  async recv(packet) {
    const result = packet.readUnsignedByte()

    if (result != 0) {
      this.client.send.emit(PacketHeader.WIZ_ALLCHAR_INFO_REQUEST)
    } else {
      console.error(`Select nation failed! Result: ${result}`)
    }
  }

  async send(nation) {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)

    packet.writeUnsignedByte(nation)

    this.client.gameSocket.emit('send', packet)
  }
}

export default SelectNation
