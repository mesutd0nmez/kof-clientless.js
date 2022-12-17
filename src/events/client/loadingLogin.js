import PacketHeader from '../../core/enums/packetHeader.js'
import { ByteBuffer } from '../../core/utils/byteBuffer.js'
import Event from '../../core/event.js'

class LoadingLogin extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_LOADING_LOGIN,
    })
  }

  async recv(packet) {
    const result = packet.readByte()
    const queueCount = packet.readUnsignedInt()

    if (result == 1) {
      if (queueCount > 0) {
        console.info(
          `${this.client.account.username} waiting queue: ${queueCount}`
        )
        this.client.send.emit(PacketHeader.WIZ_SPEEDHACK_CHECK)
      } else {
        if (this.client.nation == 0) {
          this.client.emit('selectNation')
        } else {
          this.client.send.emit(PacketHeader.WIZ_ALLCHAR_INFO_REQUEST)
        }
      }
    } else {
      console.error(`Loading login failed! Result: ${result}`)
    }
  }

  async send() {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)

    // Start Loading
    packet.writeUnsignedByte(1)

    this.client.gameSocket.emit('send', packet)
  }
}

export default LoadingLogin
