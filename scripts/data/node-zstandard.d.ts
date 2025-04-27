declare module 'node-zstandard' {
  import { Stream } from 'stream';
  
  export function compress(input: Buffer): Buffer;
  export function compressFileToFile(inputPath: string, outputPath: string): void;
  export function compressStreamToFile(inputStream: Stream, outputPath: string): void;
  export function decompress(input: Buffer): Buffer;
  export function decompressFileToFile(inputPath: string, outputPath: string): void;
  export function decompressionStreamFromFile(inputPath: string): Stream;
  export function decompressFileToStream(inputPath: string, outputStream: Stream): void;
} 