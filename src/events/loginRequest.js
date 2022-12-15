import PacketHeader from '../core/enums/packetHeader.js'
import Platform from '../core/enums/platform.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'

class LoginRequest extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_LOGIN_REQUEST,
    })
  }

  async recv(packet) {
    if (this.client.options.platform != Platform.JPKO) {
      packet.readUnsignedShort()
    }

    const result = packet.readByte()

    switch (result) {
      case 1: // Success
        {
          const premiumTime = packet.readShort()

          const isDoubleByte =
            this.client.options.platform != Platform.CNKO &&
            this.client.options.platform != Platform.JPKO

          const accountId = packet.readString(isDoubleByte)

          console.info(
            `Login ${accountId} success! Premium time: ${premiumTime}`
          )

          this.client.send.emit(PacketHeader.WIZ_SERVER_LIST)
        }
        break
      case 5: // Already Online
        {
          const serverIp = packet.readString(true)

          if (
            this.client.options.platform == Platform.CNKO ||
            this.client.options.platform == Platform.USKO
          ) {
            const serverPort = packet.readShort()
            const crc = packet.readUnsignedInt()

            this.client.emit(
              'userAlreadyOnline',
              serverIp.trim(),
              serverPort,
              crc
            )
          } else {
            this.client.emit('userAlreadyOnline', serverIp.trim(), 15001)
          }
        }
        break

      default:
        {
          console.error(`Login failed! Result: ${result}`)
        }
        break
    }
  }

  async send(username, password) {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)

    packet.writeString(username, true)
    packet.writeString(password, true)
    packet.writeInt(0)
    packet.writeByte(0)

    this.client.loginSocket.emit('send', packet)
  }
}

export default LoginRequest
