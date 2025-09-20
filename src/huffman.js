const MinHeap = require('./MinHeap.js')

class Node {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}

function calculateFreq(text) {
    const freq = {};
    for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
    }
    return freq;
}

function buildHuffmanTree(freq) {
    const heap = new MinHeap();

    for (const char in freq) {
        heap.insert(new Node(char, freq[char]))
    }

    while (heap.size() > 1) {
        const left = heap.extractMin();
        const right = heap.extractMin();
        const merged = new Node(null, left.freq + right.freq, left, right);
        heap.insert(merged);
    }

    return heap.extractMin();
}

function generateCodes(root) {
    const codes = {};

    if (!root.left && !root.right) {
        codes[root.char] = '0';
        return codes;
    }

    function traverse(node, code) {

        if (node.char !== null) {
            codes[node.char] = code;
            return;
        }
        traverse(node.left, code + '0');
        traverse(node.right, code + '1');
    }

    traverse(root, '');
    return codes;
}

// function encode(text, codes) {
//     let encoded = '';
//     for (let i = 0; i < text.length; i++) {
//         encoded += codes[text[i]];
//     }
//     return encoded;
// }

function encode(text, codes) {
    // total bits required
    let totalBits = 0;
    for (let i = 0; i < text.length; i++) {
        totalBits += codes[text[i]].length;
    }

    const bufferSize = 4 + Math.ceil(totalBits / 8);
    const buffer = Buffer.alloc(bufferSize);

    buffer.writeUInt32BE(totalBits, 0);

    let byteIndex = 4;
    let currentByte = 0;
    let bitPosition = 7;

    for (let i = 0; i < text.length; i++) {
        const code = codes[text[i]];

        for (let j = 0; j < code.length; j++) {
            if (code[j] === '1') {
                currentByte |= (1 << bitPosition);  
            }

            bitPosition--;
            if (bitPosition < 0) {
                buffer[byteIndex++] = currentByte;
                currentByte = 0;
                bitPosition = 7;
            }
        }
    }

    if (bitPosition < 7) {
        buffer[byteIndex] = currentByte;
    }
    return buffer;
}

// function decode(encoded, root) {
//     let decoded = '';
//     let current = root;

//     for(let i = 0; i < encoded.length; i++) {
//         current = encoded[i] === '0' ? current.left : current.right;

//         if (current.char !== null) {
//             decoded += current.char;
//             current = root;
//         }
//     }
//     return decoded;
// }

function decode(buffer, root) {
    const bitLength = buffer.readUInt32BE(0);

    let decoded = '';
    let current = root;
    let byteIndex = 4;
    let bitPosition = 7;

    for (let i = 0; i < bitLength; i++) {
        const bit = (buffer[byteIndex] >> bitPosition) & 1;

        current = bit === 0 ? current.left : current.right;

        if (current.char !== null) {
            decoded += current.char;
            current = root;
        }

        bitPosition--;
        if (bitPosition < 0) {
            byteIndex++;
            bitPosition = 7;
        }
    }

    return decoded;
}

module.exports = {
    calculateFreq,
    buildHuffmanTree,
    generateCodes,
    encode,
    decode,
    Node
};