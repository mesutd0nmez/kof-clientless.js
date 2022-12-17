import PacketHeader from '../../core/enums/packetHeader.js'
import Platform from '../../core/enums/platform.js'
import { ByteBuffer } from '../../core/utils/byteBuffer.js'
import Event from '../../core/event.js'

class XignCode extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_XIGNCODE,
    })
  }

  async recv(packet) {
    console.info('Xign Recv -> ' + packet.toHex())
  }

  async send() {}
}

export default XignCode
