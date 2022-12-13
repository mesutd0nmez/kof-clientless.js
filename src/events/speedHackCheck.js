import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'

class SpeedHack extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_SPEEDHACK_CHECK,
    })
  }

  async recv() {}

  async send(init) {
    const packet = new ByteBuffer()

    if (init == 1) {
      clearInterval(this.speedHackCheckInterval)
      this.speedHackCheckInterval = setInterval(() => {
        this.client.send.emit(PacketHeader.WIZ_SPEEDHACK_CHECK)
      }, 10000)

      console.info('Speedhack has been started')
    }

    const fTime = (Date.now() - this.client.startTime) / 10000000.0

    console.info(`Speedhack interval: ${fTime} seconds`)

    packet.writeUnsignedByte(this.options.header)
    packet.writeUnsignedByte(init)
    packet.writeFloat(fTime)
    packet.writeUnsignedByte(0)

    this.client.socket.emit('send', packet)
  }
}

export default SpeedHack
