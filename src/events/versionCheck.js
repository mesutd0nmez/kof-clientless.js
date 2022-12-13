import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'
import { Platform } from '../client.js'

class VersionCheck extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_VERSION_CHECK,
    })
  }

  async recv(packet) {
    if (
      this.client.options.platform != Platform.CNKO &&
      this.client.options.platform != Platform.JPKO
    ) {
      // Unknown Byte
      packet.readByte()
    }

    const version = packet.readUnsignedShort()

    if (this.client.options.aes) {
      const key = packet.readString()

      this.client.socket.aesPublicKey = Buffer.alloc(16)
      this.client.socket.aesPublicKey.write(key)

      console.info(`Game Version: ${version}`)
      console.info(`Game Cryption Key (AES): ${key}`)
    } else {
      const key = packet.readUnsignedBigInt()
      this.client.socket.jvCryptionKey = key

      console.info(`Game Version: ${version}`)
      console.info(`Game Cryption Key (JV): ${key}`)
    }

    this.client.send.emit(
      PacketHeader.WIZ_LOGIN,
      this.client.account.username,
      this.client.account.password
    )
  }

  async send() {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)

    this.client.socket.emit('send', packet)
  }
}

export default VersionCheck
