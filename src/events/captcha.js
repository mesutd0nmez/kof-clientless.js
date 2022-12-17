import PacketHeader from '../core/enums/packetHeader.js'
import Event from '../core/event.js'
import fs from 'fs'
import createBitmapFile from '../core/utils/bitmap.js'
import { ByteBuffer } from '../core/utils/byteBuffer.js'

class Captcha extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_CAPTCHA,
    })
  }

  async recv(packet) {
    packet.readUnsignedByte()
    const opcode = packet.readUnsignedByte() // 1 = Initialize -

    switch (opcode) {
      case 1:
        {
          const result = packet.readUnsignedByte()

          if (result == 1) {
            // image size
            packet.readUnsignedInt()

            const imageBody = packet.read()

            const captchaImage = await createBitmapFile({
              imageData: imageBody.toArray(),
            })

            fs.writeFile('captcha.bmp', captchaImage, () => {})

            this.client.emit('captchaReady')
          } else {
            console.info('Captcha not initialized')
          }
        }
        break
      case 2:
        {
          const result = packet.readUnsignedByte()

          if (result == 1) {
            this.client.send.emit(PacketHeader.WIZ_LOADING_LOGIN)
            this.client.emit('captchaSuccess')
          } else {
            const attempStatus = packet.readUnsignedByte()
            this.client.emit('captchaFailed', attempStatus)
          }
        }
        break
    }
  }

  async send(opcode, code) {
    const packet = new ByteBuffer()

    packet.writeUnsignedByte(this.options.header)
    packet.writeUnsignedByte(1)

    // 1 - Refresh, 2 - Submit
    packet.writeUnsignedByte(opcode)

    if (opcode == 2) {
      packet.writeString(code, true)
    }

    this.client.gameSocket.emit('send', packet)
  }
}

export default Captcha
