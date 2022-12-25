function bitmapFileHeader({
  filesize = 0,
  applicationHeader = 0,
  imageDataOffset = 0,
}) {
  const buffer = Buffer.alloc(14)
  // A bitmap file starts with a "BM" in ASCII.
  buffer.write('B', 0)
  buffer.write('M', 1)
  // The entire filesize.
  buffer.writeInt32LE(filesize, 2)
  // 4 bytes reserved for the application creating the image.
  buffer.writeInt32LE(applicationHeader, 6)
  // The byte offset to access the pixel data.
  buffer.writeInt32LE(imageDataOffset, 10)

  return buffer
}

// Creates a DIB header, specifically a BITMAPINFOHEADER type
// since it's the most widely supported.
function dibHeader({
  width,
  height,
  bitsPerPixel,
  bitmapDataSize,
  numberOfColorsInPalette,
}) {
  const buffer = Buffer.alloc(40)
  // The size of the header.
  buffer.writeInt32LE(40, 0)
  // The width and height of the bitmap image.
  buffer.writeInt32LE(width, 4)
  buffer.writeInt32LE(height, 8)
  // The number of color planes, which in bitmap files is always 1
  buffer.writeInt16LE(1, 12)
  buffer.writeInt16LE(bitsPerPixel, 14)

  // Compression method, not supported in this package.
  buffer.writeInt32LE(0, 16)
  buffer.writeInt32LE(bitmapDataSize, 20)
  // The horizontal and vertical resolution of the image.
  // On monitors: 72 DPI × 39.3701 inches per metre yields 2834.6472
  buffer.writeInt32LE(2835, 24)
  buffer.writeInt32LE(2835, 28)
  // Number of colors in the palette.
  buffer.writeInt32LE(numberOfColorsInPalette, 32)
  // Number of important colors used.
  buffer.writeInt32LE(0, 36)

  return buffer
}

async function createBitmapFile({ imageData, colorTable = Buffer.alloc(0) }) {
  if (imageData.length < 18) {
    throw new Error('Invalid image data, length must be at least 18 bytes')
  }

  imageData = Buffer.from(imageData)

  const width = imageData.readUInt16LE(12)
  const height = imageData.readUInt16LE(14)
  const bitsPerPixel = imageData.readUInt16LE(16)

  imageData = imageData.slice(18, imageData.length)

  const imageDataOffset = 54 + colorTable.length
  const filesize = imageDataOffset + imageData.length
  let fileContent = Buffer.alloc(filesize)
  let fileHeader = bitmapFileHeader({
    filesize,
    imageDataOffset,
  })

  fileHeader.copy(fileContent)

  dibHeader({
    width,
    height,
    bitsPerPixel,
    bitmapDataSize: 54 + colorTable.length + imageData.length,
    numberOfColorsInPalette: colorTable.length / 4,
  }).copy(fileContent, 14)

  colorTable.copy(fileContent, 54)

  imageData.copy(fileContent, imageDataOffset)

  return fileContent
}

export default createBitmapFile
