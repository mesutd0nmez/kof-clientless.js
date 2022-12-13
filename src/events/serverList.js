import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'
import { Platform } from '../client.js'

class ServerList extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_SERVER_LIST,
    })
  }

  async recv(packet) {
    if (this.client.options.platform == Platform.USKO) {
      packet.readUnsignedByte() // this getting send request
      packet.readUnsignedByte() // this getting send request
    }

    const serverCount = packet.readUnsignedByte()

    switch (this.client.options.platform) {
      case Platform.JPKO:
        {
          for (let i = 0; i < 1; i++) {
            const ip = packet.readString(true)
            const name = packet.readString(true, 'SHIFT_JIS')
            const onlineCount = packet.readShort()
            const id = packet.readShort()
            const groupId = packet.readShort()

            const karusKingName = packet.readString(true, 'SHIFT_JIS')
            const karusKingNotice = packet.readString(true, 'SHIFT_JIS')

            const humanKingName = packet.readString(true, 'SHIFT_JIS')
            const humanKingNotice = packet.readString(true, 'SHIFT_JIS')

            this.client.serverList.add({
              ip,
              name,
              onlineCount,
              id,
              groupId,
              karusKingName,
              karusKingNotice,
              humanKingName,
              humanKingNotice,
            })
          }
        }
        break
      case Platform.CNKO:
        {
          for (let i = 0; i < serverCount; i++) {
            const ip = packet.readString(true)
            const lanIp = packet.readString(true)
            const name = packet.readString(true, 'GB2312')
            const id = packet.readShort()
            const groupId = packet.readShort()
            const groupOrder = packet.readShort()
            const port = packet.readShort()
            const playerCap = packet.readShort()
            const freePlayerCap = packet.readShort()
            const karusKingNotice = packet.readString(true, 'GB2312')
            const humanKingNotice = packet.readString(true, 'GB2312')

            this.client.serverList.add({
              ip,
              lanIp,
              name,
              id,
              groupId,
              groupOrder,
              port,
              playerCap,
              freePlayerCap,
              karusKingNotice,
              humanKingNotice,
            })
          }
        }
        break
      case Platform.USKO:
        {
          for (let i = 0; i < serverCount; i++) {
            const ip = packet.readString(true)
            const lanIp = packet.readString(true, 'windows-1254')
            const name = packet.readString(true, 'windows-1254')
            const id = packet.readShort()
            const groupId = packet.readShort()
            const groupOrder = packet.readShort()
            const playerCap = packet.readShort()
            const freePlayerCap = packet.readShort()

            const unknown2 = packet.readUnsignedByte()
            const bannerType = packet.readUnsignedByte()

            const karusKingName = packet.readString(true, 'windows-1254')
            const karusKingNotice = packet.readString(true, 'windows-1254')

            const humanKingName = packet.readString(true)
            const humanKingNotice = packet.readString(true)

            this.client.serverList.add({
              ip,
              lanIp,
              name,
              id,
              groupId,
              groupOrder,
              playerCap,
              freePlayerCap,
              unknown2,
              bannerType,
              karusKingName,
              karusKingNotice,
              humanKingName,
              humanKingNotice,
            })
          }
        }
        break
    }

    this.client.emit('serverList', this.client.serverList)
  }

  async send() {
    const packet = new ByteBuffer()
    packet.writeUnsignedByte(this.options.header)

    if (this.client.options.platform == Platform.USKO) {
      packet.writeUnsignedByte(1)
      packet.writeUnsignedByte(0)
    }

    this.client.socket.emit('send', packet)
  }
}

export default ServerList
