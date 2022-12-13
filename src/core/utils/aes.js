import crypto from 'crypto'

function AESEncryption(stream, key, iv) {
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv)
  return Buffer.concat([cipher.update(Buffer.from(stream)), cipher.final()])
}

function AESDecryption(stream, key, iv) {
  const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
  return Buffer.concat([cipher.update(Buffer.from(stream)), cipher.final()])
}

export { AESEncryption, AESDecryption }
