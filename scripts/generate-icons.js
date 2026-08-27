import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b, outputPath) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(2, 9); // Color type 2: Truecolor (RGB)
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at each scanline
  const rowBytes = width * 3;
  const rawData = Buffer.alloc(height * (rowBytes + 1));
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      
      // Draw circular / bordered emblem in PNG
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = (width / 2) - (width * 0.08);

      if (dist < maxRadius) {
        if (dist > maxRadius - (width * 0.03)) {
          // Gold border
          rawData[pixelOffset] = 217; // R
          rawData[pixelOffset + 1] = 119; // G
          rawData[pixelOffset + 2] = 6; // B
        } else if (dist < maxRadius * 0.4) {
          // Gold center
          rawData[pixelOffset] = 245;
          rawData[pixelOffset + 1] = 158;
          rawData[pixelOffset + 2] = 11;
        } else {
          // Emerald green background
          rawData[pixelOffset] = r;
          rawData[pixelOffset + 1] = g;
          rawData[pixelOffset + 2] = b;
        }
      } else {
        // Deep emerald outer
        rawData[pixelOffset] = 11;
        rawData[pixelOffset + 1] = 41;
        rawData[pixelOffset + 2] = 30;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const finalPng = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, finalPng);
}

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcTarget = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crcVal = crc32(crcTarget);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

createPng(192, 192, 15, 56, 42, path.resolve('public/icon-192.png'));
createPng(512, 512, 15, 56, 42, path.resolve('public/icon-512.png'));
console.log('Generated icon-192.png and icon-512.png successfully.');
