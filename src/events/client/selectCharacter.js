import PacketHeader from '../../core/enums/packetHeader.js'
import { ByteBuffer } from '../../core/utils/byteBuffer.js'
import Event from '../../core/event.js'

class SelectCharacter extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_SEL_CHAR,
    })
  }

  async recv(packet) {
    const result = packet.readByte()

    if (result == 1) {
      const zone = packet.readByte()
      const x = packet.readUnsignedShort() / 10.0
      const y = packet.readUnsignedShort() / 10.0
      const z = packet.readUnsignedShort() / 10.0

      const victoryNation = packet.readByte()

      const selectedCharacter =
        this.client.characterList[this.client.selectedCharacterIndex]

      console.info(
        `Selected character ${selectedCharacter.name}, ` +
          `Zone: ${zone} X: ${x} Y: ${y} Z: ${z} Victory Nation: ${victoryNation}`
      )

      this.client.send.emit(PacketHeader.WIZ_BUFFER_SIZE)
      this.client.send.emit(PacketHeader.WIZ_SPEEDHACK_CHECK, 1)
      this.client.send.emit(PacketHeader.WIZ_SERVER_INDEX)
    } else {
      console.error(`Select character failed, Result: ${result}`)
    }
  }

  async send(index) {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)

    const selectedCharacter = this.client.characterList[index]

    packet.writeString(this.client.account.username, true)
    packet.writeString(selectedCharacter.name, true)
    packet.writeByte(1)
    packet.writeByte(selectedCharacter.zone)
    packet.writeUnsignedShort(0)

    this.client.gameSocket.emit('send', packet)
  }
}

export default SelectCharacter
