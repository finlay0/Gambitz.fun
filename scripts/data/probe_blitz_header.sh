#!/bin/bash

# Exit on error
set -e

# Exit codes
EXIT_USAGE=1
EXIT_NO_FILE=2
EXIT_NO_MATCH=3

# Input file path
INPUT_FILE="data/raw/blitz_2025_01.pgn.zst"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file not found: $INPUT_FILE"
    exit $EXIT_NO_FILE
fi

# Get file size in bytes
FILE_SIZE=$(stat -c %s "$INPUT_FILE")

# Convert to GB
FILE_SIZE_GB=$((FILE_SIZE / 1024 / 1024 / 1024))

echo "Probing file of size ${FILE_SIZE_GB}GB..."

# Start at 0 and increment by 2GB each time
for ((offset=0; offset<FILE_SIZE; offset+=2147483648)); do  # 2GB in bytes
    # Convert offset to human-readable format
    offset_hr=$(numfmt --to=iec --suffix=B $offset)
    
    echo -n "Checking at $offset_hr... "
    
    # Extract ~100 MB from the specified offset
    DATA=$(dd if="$INPUT_FILE" bs=1 skip="$offset" 2>/dev/null | \
           zstd -dc --no-check 2>/dev/null | \
           head -c 100M)
    
    # Check for 180+2 time control
    if echo "$DATA" | grep -m 1 '\[TimeControl "180+2"\]' >/dev/null; then
        # Find the exact position and format of the first game
        MATCH=$(echo "$DATA" | grep -m 1 '\[TimeControl "180+2"\]')
        LINE_NUM=$(echo "$DATA" | grep -n -m 1 '\[TimeControl "180+2"\]' | cut -d: -f1)
        
        echo "✔ Found first 180+2 game at line $LINE_NUM"
        echo "First game header:"
        echo "$DATA" | sed -n "${LINE_NUM},$((LINE_NUM+10))p" | head -n 10
        
        # Count how many consecutive 180+2 games follow
        echo -e "\nChecking next 10 games for 180+2 time control..."
        GAME_COUNT=0
        CURRENT_LINE=$LINE_NUM
        
        for i in {1..10}; do
            # Find the next game start
            NEXT_GAME_LINE=$(echo "$DATA" | sed -n "${CURRENT_LINE},\$p" | grep -n -m 1 '^\[Event' | cut -d: -f1)
            if [ -z "$NEXT_GAME_LINE" ]; then
                break
            fi
            
            CURRENT_LINE=$((CURRENT_LINE + NEXT_GAME_LINE - 1))
            
            # Check if this game is 180+2
            if echo "$DATA" | sed -n "${CURRENT_LINE},$((CURRENT_LINE+10))p" | grep -q '\[TimeControl "180+2"\]'; then
                GAME_COUNT=$((GAME_COUNT + 1))
                echo "Game $i: 180+2 found"
            else
                echo "Game $i: Different time control"
                break
            fi
        done
        
        echo -e "\nFound $GAME_COUNT consecutive 180+2 games"
        exit 0
    else
        echo "✗ No 180+2 found"
    fi
done

# If we get here, we didn't find any matches
echo "No 180+2 games found in the entire file"
exit $EXIT_NO_MATCH 