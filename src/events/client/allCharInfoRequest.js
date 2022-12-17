import PacketHeader from '../../core/enums/packetHeader.js'
import Platform from '../../core/enums/platform.js'
import { ByteBuffer } from '../../core/utils/byteBuffer.js'
import Event from '../../core/event.js'

class AllCharInfoRequest extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_ALLCHAR_INFO_REQUEST,
    })
  }

  async recv(packet) {
    const result = packet.readByte()

    if (result == 1) {
      packet.readByte() // Unknown

      const result = packet.slice(packet.length - 3, packet.length)

      const characterLoaded = Buffer.from(result.toArray()).equals(
        Buffer.from([0x0c, 0x02, 0x00])
      )

      if (!characterLoaded) {
        for (let i = 0; i < 4; i++) {
          const character = {
            name: packet.readString(true),
            race: packet.readByte(),
            class: packet.readUnsignedShort(),
            level: packet.readByte(),
            face: packet.readByte(),
            hair: packet.readInt(),
            zone: packet.readByte(),
          }

          character.equipment = []

          for (let j = 0; j < 8; j++) {
            const equipment = {
              pos: j,
              id: packet.readUnsignedInt(),
              durability: packet.readUnsignedShort(),
            }

            character.equipment.push(equipment)
          }

          this.client.characterList.push(character)
        }
      }

      if (
        this.client.characterList.length > 0 &&
        this.client.selectedCharacterIndex <= this.client.characterList.length
      ) {
        if (
          this.client.options.platform == Platform.USKO ||
          this.client.options.platform == Platform.CNKO
        ) {
          if (characterLoaded) {
            this.client.emit('characterList', this.client.characterList)
          }
        } else {
          this.client.emit('characterList', this.client.characterList)
        }
      }
    } else {
      console.error(`All char info request failed! Result: ${result}`)
    }
  }

  async send() {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)
    packet.writeByte(1)

    this.client.gameSocket.emit('send', packet)
  }
}

export default AllCharInfoRequest
