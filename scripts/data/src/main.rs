use polars::prelude::*;
use std::fs::File;
use std::io::{BufRead, BufReader, Write};
use std::process::{Command, Stdio, Child};
use std::time::Instant;
use std::env;

fn start_stockfish() -> Child {
    Command::new("stockfish")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to start Stockfish")
}

fn get_cp_from_stockfish(stockfish: &mut Child, fen: &str) -> Option<i64> {
    let stdin = stockfish.stdin.as_mut().unwrap();
    let stdout = stockfish.stdout.as_mut().unwrap();
    let mut reader = BufReader::new(stdout);

    writeln!(stdin, "position fen {}", fen).ok()?;
    writeln!(stdin, "go depth 12").ok()?;
    let mut cp: Option<i64> = None;
    let mut buf = String::new();
    loop {
        buf.clear();
        if reader.read_line(&mut buf).is_err() {
            break;
        }
        if buf.contains("score cp ") {
            if let Some(idx) = buf.find("score cp ") {
                let rest = &buf[idx + 9..];
                if let Some(end) = rest.find(' ') {
                    if let Ok(val) = rest[..end].trim().parse::<i64>() {
                        cp = Some(val);
                    }
                } else if let Ok(val) = rest.trim().parse::<i64>() {
                    cp = Some(val);
                }
            }
        }
        if buf.contains("bestmove") {
            break;
        }
    }
    cp
}

fn main() -> PolarsResult<()> {
    let input_path = "/home/finlay/chessbets.fun/data/fen_moves.parquet";
    let output_path = "/home/finlay/chessbets.fun/data/training.parquet";
    let start = Instant::now();

    println!("CWD: {:?}", env::current_dir());
    println!("Input path: {}", input_path);
    println!("Output path: {}", output_path);

    // Try to list the data directory for debugging
    match std::fs::read_dir("/home/finlay/chessbets.fun/data") {
        Ok(entries) => {
            println!("data/ directory contents:");
            for entry in entries {
                if let Ok(e) = entry {
                    println!("- {}", e.path().display());
                }
            }
        }
        Err(e) => println!("Could not read data/ directory: {}", e),
    }

    // Correct way to read Parquet as DataFrame
    let mut df = ParquetReader::new(File::open(input_path)?).finish()?;

    // TEST MODE: Only process the first 1000 rows for validation. Remove or comment this after testing.
    // let row_limit = 1000;
    // let mut df = df.head(Some(row_limit));
    let fens = df.column("fen")?.str()?;
    let n = fens.len();
    let mut stockfish = start_stockfish();
    let mut score_cp: Vec<i64> = Vec::with_capacity(n);

    for (i, fen_opt) in fens.into_iter().enumerate() {
        let fen = match fen_opt {
            Some(f) => f,
            None => {
                score_cp.push(0);
                continue;
            }
        };
        let cp = get_cp_from_stockfish(&mut stockfish, fen).unwrap_or(0);
        score_cp.push(cp);
        if (i + 1) % 100 == 0 {
            println!("Processed {} rows...", i + 1);
        }
    }

    df.hstack_mut(&[Series::new("score_cp".into(), score_cp).into()])?;
    ParquetWriter::new(File::create(output_path)?)
        .with_compression(ParquetCompression::Snappy)
        .finish(&mut df)?;

    let elapsed = start.elapsed().as_secs_f64();
    println!(
        "\nDone. Processed {} rows in {:.2} seconds ({:.2} rows/sec)",
        n,
        elapsed,
        n as f64 / elapsed
    );
    Ok(())
} 