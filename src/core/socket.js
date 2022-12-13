import net from 'net'
import { ByteBuffer } from './utils/byteBuffer.js'
import JVCryption from './utils/jvcryption.js'
import { AESEncryption, AESDecryption } from './utils/aes.js'
import CRC32 from './utils/crc32.js'

class Socket extends net.Socket {
  constructor() {
    super()

    this.sequence = 0

    this.jvCryptionKey = 0n
    this.jvCryptionPrivateKey = 0x1207500120128966n

    this.aesPublicKey = null
    this.aesPrivateKey = Buffer.from([
      0x87, 0x1f, 0xe5, 0x23, 0x78, 0xa1, 0x88, 0xad, 0x22, 0xcf, 0x5e, 0xaa,
      0x5b, 0x18, 0x1e, 0x67,
    ])
    this.aesInitialVector = Buffer.from([
      0x32, 0x4e, 0xaa, 0x58, 0xbc, 0xb3, 0xae, 0xe3, 0x6b, 0xc7, 0x4c, 0x56,
      0x36, 0x47, 0x34, 0xf2,
    ])

    this.recvBuffer = Buffer.alloc(0)
    this.recvEvent = null

    this.on('data', async (data) => {
      if (data.length < 7) {
        console.info('Unknown Recv Packet, Packet Size < 7')
        return
      }

      const endDelimeter = data.slice(data.length - 2, data.length)

      this.recvBuffer = Buffer.concat([this.recvBuffer, data])

      if (endDelimeter.equals(Buffer.from([0x55, 0xaa]))) {
        this.emit('recv', this.recvBuffer)
        this.recvBuffer = Buffer.alloc(0)
      }
    })

    this.on('recv', async (data) => {
      const startDelimeter = data.slice(0, 2)
      const endDelimeter = data.slice(data.length - 2, data.length)

      if (!startDelimeter.equals(Buffer.from([0xaa, 0x55]))) {
        console.info('Unknown Socket Recv Header 0xAA55 != 0xAA55')
        return
      }

      if (!endDelimeter.equals(Buffer.from([0x55, 0xaa]))) {
        console.info('Unknown Socket Recv Footer 0x55AA != 0x55AA')
        return
      }

      data = new ByteBuffer(Array.from(data))

      await this.recv(data)
    })

    this.on('send', async (packet) => {
      await this.send(packet)
    })
  }

  async recv(packet) {
    const header = packet.readUnsignedShort()

    if (header != 0x55aa) {
      console.info('Unknown Process Recv Header 0xAA55 != 0xAA55')
      return
    }

    const packetSize = packet.readUnsignedShort()

    let packetBody, packetHeader

    if (this.jvCryptionKey != 0) {
      const encryptedPacketBody = packet.read(packetSize)

      const decryptedBuffer = JVCryption(
        encryptedPacketBody.toArray(),
        this.jvCryptionKey ^ this.jvCryptionPrivateKey
      )
      const decryptedPacket = new ByteBuffer(decryptedBuffer)

      const cryptionHeader = decryptedPacket.readUnsignedShort()

      if (cryptionHeader != 0x1efc) {
        console.info('Unknown JVCryption Header 0x1EFC != 0x1EFC')
        return
      }

      // TODO: Implement Sequence
      decryptedPacket.readUnsignedShort()

      // dummy = 0x00
      decryptedPacket.readUnsignedByte()

      packetHeader = decryptedPacket.readUnsignedByte()

      packetBody = decryptedPacket

      if (packetBody.available > 1) {
        packetBody = packetBody.read()
      }
    } else if (this.aesPublicKey != null) {
      // 1 = Public Key | 2 = Private Key
      const usingEncryptionKey = packet.readUnsignedByte()

      if (usingEncryptionKey != 1 && usingEncryptionKey != 2) {
        console.info(
          `Unknown AES Encryption Using Key ${usingEncryptionKey} != (1 or 2)}`
        )
        return
      }

      const encryptedPacketBody = packet.read(packetSize - 1)

      const encryptionKey =
        usingEncryptionKey == 1 ? this.aesPublicKey : this.aesPrivateKey
      const decryptedBuffer = AESDecryption(
        encryptedPacketBody.toArray(),
        encryptionKey,
        this.aesInitialVector
      )
      const decryptedPacket = new ByteBuffer(Array.from(decryptedBuffer))

      packetHeader = decryptedPacket.readUnsignedByte()

      packetBody = decryptedPacket

      if (packetBody.available > 1) {
        packetBody = packetBody.read()
      }
    } else {
      packetHeader = packet.readUnsignedByte()

      packetBody = packet

      if (packetBody.available > 1) {
        packetBody = packet.read(packetSize - 1)
      }
    }

    const footer = packet.readUnsignedShort()

    if (footer != 0xaa55) {
      console.info('Unknown Process Recv Footer 0x55AA != 0x55AA')
      return
    }

    this.recvEvent.emit(packetHeader, new ByteBuffer(packetBody))

    if (packet.available > 1) {
      await this.recv(packet.read())
    }
  }

  async send(packet) {
    const buffer = new ByteBuffer()

    buffer.writeUnsignedShort(0x55aa)

    if (this.jvCryptionKey != 0) {
      const rawPacket = new ByteBuffer()

      rawPacket.writeUnsignedInt(++this.sequence)
      rawPacket.write(packet)

      rawPacket.writeUnsignedInt(CRC32(rawPacket.toArray()))

      const encryptedBuffer = JVCryption(
        rawPacket.toArray(),
        this.jvCryptionKey ^ this.jvCryptionPrivateKey
      )
      const encryptedPacket = new ByteBuffer(encryptedBuffer)

      buffer.writeUnsignedShort(encryptedPacket.length)
      buffer.write(encryptedPacket)
    } else if (this.aesPublicKey != null) {
      const rawPacket = new ByteBuffer()

      if (this.sequence == 250) {
        this.sequence = 0
      }

      rawPacket.writeUnsignedByte(++this.sequence)
      rawPacket.write(packet)

      const encryptedBuffer = AESEncryption(
        rawPacket.toArray(),
        this.aesPublicKey,
        this.aesInitialVector
      )
      const encryptedPacket = new ByteBuffer(Array.from(encryptedBuffer))

      buffer.writeUnsignedShort(encryptedPacket.length + 1)

      // Client always send packet using only public key it is 1
      buffer.writeUnsignedByte(1)

      buffer.write(encryptedPacket)
    } else {
      buffer.writeUnsignedShort(packet.length)
      buffer.write(packet)
    }

    buffer.writeUnsignedShort(0xaa55)

    this.write(buffer.raw)
  }
}

export default Socket
