import PacketHeader from '../../core/enums/packetHeader.js'
import { ByteBuffer } from '../../core/utils/byteBuffer.js'
import Event from '../../core/event.js'

class HackTool extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_HACKTOOL,
    })
  }

  async recv(packet) {
    const result = packet.readUnsignedByte()
    const reason = packet.readByte()

    switch (result) {
      case 6: // 6 = CRC Operation
        {
          if (reason != -1) {
            this.client.send.emit(PacketHeader.WIZ_LOADING_LOGIN)
          } else {
            console.info('Invalid crc disconnected from server')
          }
        }
        break
    }
  }

  async send(type, crc, length) {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)

    switch (type) {
      case 6: // 6 = CRC Operation
        {
          packet.writeUnsignedByte(type)

          packet.write(Buffer.from(crc, 'hex'))
          packet.writeInt(length)
        }
        break
    }

    this.client.gameSocket.emit('send', packet)
  }
}

export default HackTool
