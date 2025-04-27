import { ParquetReader } from 'parquetjs-lite';

async function peek() {
  // @ts-ignore
  const reader = await ParquetReader.openFile('data/fen_moves.parquet');
  const cursor = reader.getCursor();

  console.log('=== First 5 rows ===');
  for (let i = 0; i < 5; i++) {
    console.log(await cursor.next());
  }

  // Now jump ahead ~midway
  // (you'll need to reopen; parquetjs-lite cursor isn't rewindable)
  await reader.close();
  // @ts-ignore
  const reader2 = await ParquetReader.openFile('data/fen_moves.parquet');
  const cursor2 = reader2.getCursor();
  const total = reader2.getRowCount();
  const skip = Math.floor(total / 2);
  for (let i = 0; i < skip; i++) await cursor2.next();
  console.log('=== 5 rows around the middle ===');
  for (let i = 0; i < 5; i++) {
    console.log(await cursor2.next());
  }
  await reader2.close();
}

peek().catch(console.error); 