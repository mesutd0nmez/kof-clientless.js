import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'
import { Platform } from '../client.js'

class LoginRequest extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_LOGIN_REQUEST,
    })
  }

  async recv(packet) {
    if (this.client.options.platform != Platform.JPKO)
      packet.readUnsignedShort()

    const result = packet.readByte()

    if (result == 1) {
      const premiumTime = packet.readShort()

      const isDoubleByte =
        this.client.options.platform != Platform.CNKO &&
        this.client.options.platform != Platform.JPKO

      const accountId = packet.readString(isDoubleByte)

      console.info(`Login ${accountId} success! Premium time: ${premiumTime}`)

      this.client.send.emit(PacketHeader.WIZ_SERVER_LIST)
    } else {
      console.error(`Login failed! Result: ${result}`)
    }
  }

  async send(username, password) {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)

    packet.writeString(username, true)
    packet.writeString(password, true)
    packet.writeInt(0)
    packet.writeByte(0)

    this.client.socket.emit('send', packet)
  }
}

export default LoginRequest
