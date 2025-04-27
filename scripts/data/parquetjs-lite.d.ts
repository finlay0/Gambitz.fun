declare module 'parquetjs-lite' {
  export class ParquetSchema {
    constructor(schema: Record<string, { type: string }>);
  }
  
  export class ParquetWriter {
    static openFile(schema: ParquetSchema, path: string, opts?: Record<string, any>): Promise<ParquetWriter>;
    static openStream(schema: ParquetSchema, outputStream: any, opts?: Record<string, any>): Promise<ParquetWriter>;
    
    constructor(schema: ParquetSchema, envelopeWriter: any, opts: Record<string, any>);
    
    appendRow(row: Record<string, any>): Promise<void>;
    close(callback?: () => void): Promise<void>;
    setMetadata(key: string, value: string): void;
    setRowGroupSize(cnt: number): void;
    setPageSize(cnt: number): void;
  }
  
  export class ParquetEnvelopeReader {}
  export class ParquetReader {}
  export class ParquetEnvelopeWriter {
    static openStream(schema: ParquetSchema, outputStream: any, opts?: Record<string, any>): Promise<ParquetEnvelopeWriter>;
  }
  export class ParquetTransformer {}
  export class ParquetShredder {}
  export function force32(): void;
} 