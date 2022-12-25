import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'

class Cryption extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_CRYPTION,
    })
  }

  async recv(packet) {
    const key = packet.readUnsignedBigInt()

    console.info(`Login Cryption Key (JV): ${key}`)

    this.client.loginSocket.jvCryptionKey = key

    this.client.send.emit(
      PacketHeader.WIZ_LOGIN_REQUEST,
      this.client.account.username,
      this.client.account.password
    )
  }

  async send() {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)

    this.client.loginSocket.emit('send', packet)
  }
}

export default Cryption
