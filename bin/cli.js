#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { calculateFreq, buildHuffmanTree, generateCodes, encode, decode, Node } = require('../src/huffman.js');

function createVizz(message, outputPath, inputPath) {
    const freq = calculateFreq(message);
    const tree = buildHuffmanTree(freq);
    const codes = generateCodes(tree);
    const encoded = encode(message, codes);

    const originalBits = message.length * 8;
    const compressedBits = encoded.readUInt32BE(0);
    const savedBits = originalBits - compressedBits;
    const ratio = ((savedBits / originalBits) * 100).toFixed(1);

    const vizzData = {
        format: 'vizz',
        version: '1.0',
        type: 'vizz file',
        originalFileName: path.basename(inputPath),
        data: encoded.toString('base64'),
        codes: codes
    };

    fs.writeFileSync(outputPath, JSON.stringify(vizzData));
    return {
        ...vizzData,
        stats: {
            originalBits,
            compressedBits,
            savedBits,
            compressionRatio: ratio + '%'
        }
    };
}

function decodeVizz(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const root = new Node(null, 0);

    for (const char in data.codes) {
        const code = data.codes[char];
        let current = root;

        for (let i = 0; i < code.length; i++) {
            if (code[i] === '0') {
                if (!current.left) current.left = new Node(null, 0);
                current = current.left;
            } else {
                if (!current.right) current.right = new Node(null, 0);
                current = current.right;
            }
        }
        current.char = char;
    }

    const encodedBuffer = Buffer.from(data.data, 'base64');
    const decoded = decode(encodedBuffer, root);
    const originalFileName = data.originalFileName || 'decompressed.txt';
    fs.writeFileSync(originalFileName, decoded);
    return { decoded, originalFileName };
}

function showHelp() {
    console.log(`
Vizzip - A simple text compression tool using Huffman coding.

Usage:
  npx vizzip input.txt
  npx vizzip --decompress file.vizz
  npx vizzip --help

Examples:
  npx vizzip message.txt   (creates message.vizz)
  npx vizzip --decompress message.vizz
`);
}

function main() {

    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }
    try {
        if (args.includes('--decompress') || args.includes('-d')) {
            const vizzFile = args.find(arg => arg.endsWith('.vizz'));
            if (!vizzFile) {
                console.error("Error: Please provide a .vizz file to decompress.");
                return;
            }
            const decodedMessage = decodeVizz(vizzFile);
            console.log("Decompressed data saved to:", decodedMessage.originalFileName);
        }
        else {
            const inputFile = args.find(arg => !arg.startsWith('-') && !arg.startsWith('--') && !arg.endsWith('.vizz') && arg.includes('.'));
            if (!inputFile) {
                console.error("Error: Please provide a file to compress.");
                return;
            }

            if (!fs.existsSync(inputFile)) {
                console.error("Error: Input file does not exist.");
                return;
            }

            const message = fs.readFileSync(inputFile, 'utf8');
            const outputPath = path.basename(inputFile, path.extname(inputFile)) + '.vizz';

            const result = createVizz(message, outputPath, inputFile);
            console.log(`${inputFile} => ${outputPath}`);
            console.log(`Compression: ${result.stats.compressionRatio}`);
        }

    } catch (err) {
        console.error("Error:", err.message);
        return;
    }
}

main();