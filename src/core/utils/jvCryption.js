function JVCryption(dataIn, key = 0n) {
  let rkey = 2157
  let lkey = (dataIn.length * 157) & 0xff

  let dataOut = []

  let pkey = Buffer.alloc(8)
  pkey.writeBigUInt64LE(key)

  for (let i = 0; i < dataIn.length; i++) {
    let rsk = (rkey >>> 8) & 0xff
    dataOut.push(dataIn[i] ^ rsk ^ pkey[i % 8] ^ lkey)
    rkey = (rkey * 2171) >> 0
  }

  return dataOut
}

export default JVCryption
