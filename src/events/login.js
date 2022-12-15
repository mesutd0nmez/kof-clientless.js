import PacketHeader from '../core/enums/packetHeader.js'
import Platform from '../core/enums/platform.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'

class Login extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_LOGIN,
    })
  }

  async recv(packet) {
    const nation = packet.readUnsignedByte()

    this.client.nation = nation

    if (this.client.nation != 0) {
      if (this.client.options.platform == Platform.CNKO) {
        this.client.send.emit(PacketHeader.WIZ_HACKTOOL, 6, '3ebde00d', 3)
      } else if (this.client.options.platform == Platform.JPKO) {
        this.client.send.emit(PacketHeader.WIZ_ALLCHAR_INFO_REQUEST)
      }
    }
  }

  async send(username, password) {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)
    packet.writeString(username, true)
    packet.writeString(password, true)
    packet.writeByte(0)

    if (this.client.options.platform == Platform.USKO) {
      packet.writeUnsignedInt(65536)
      packet.writeByte(1)
      packet.writeUnsignedInt(0)

      // TODO: Generate random uuid
      packet.writeString('4b310467-fb9b-9133-b485df2a6d96b576', true)
    }

    this.client.gameSocket.emit('send', packet)
  }
}

export default Login
