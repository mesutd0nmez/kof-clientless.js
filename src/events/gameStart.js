import PacketHeader from '../core/enums/packetHeader.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'
import Event from '../core/event.js'

class GameStart extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_GAMESTART,
    })
  }

  async recv() {
    this.client.send.emit(PacketHeader.WIZ_GAMESTART, 2)
  }

  async send(state) {
    const packet = new ByteBuffer()

    const selectedCharacter =
      this.client.characterList[this.client.selectedCharacterIndex]

    packet.writeUnsignedByte(this.options.header)
    packet.writeUnsignedShort(state)
    packet.writeString(selectedCharacter.name)

    this.client.socket.emit('send', packet)

    this.client.gameState = state
  }
}

export default GameStart
