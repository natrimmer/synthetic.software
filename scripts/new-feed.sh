#!/usr/bin/env bash

# Script to create a new feed item
# Usage: ./scripts/new-feed.sh

set -e

# Get current date components
YEAR=$(date +%Y)
MONTH=$(date +%m)
DAY=$(date +%d)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Base directory
FEED_BASE="src/content/feed"
FEED_DIR="$FEED_BASE/$YEAR/$MONTH/$DAY"

# Create directory structure if it doesn't exist
mkdir -p "$FEED_DIR"

# Find the next feed item number globally
# Get the highest number from all existing feed items
MAX_NUM=$(find "$FEED_BASE" -name "[0-9]*.svx" -type f |
    sed 's/.*\/\([0-9]*\)\.svx/\1/' |
    sort -n |
tail -1)

# If no feed items exist yet, start at 1, otherwise increment
if [ -z "$MAX_NUM" ]; then
    NEXT_NUM=1
else
    NEXT_NUM=$((MAX_NUM + 1))
fi

FEED_FILE="$FEED_DIR/$NEXT_NUM.svx"

# Create _index.svx files if they don't exist
# Year index
if [ ! -f "$FEED_BASE/$YEAR/_index.svx" ]; then
    cat > "$FEED_BASE/$YEAR/_index.svx" << EOF
---
title: "$YEAR"
---

EOF
    echo "Created year index: $FEED_BASE/$YEAR/_index.svx"
fi

# Month index
if [ ! -f "$FEED_BASE/$YEAR/$MONTH/_index.svx" ]; then
    MONTH_NAME=$(date -j -f "%m" "$MONTH" +"%B" 2>/dev/null || date -d "$YEAR-$MONTH-01" +"%B" 2>/dev/null || echo "Month")
    cat > "$FEED_BASE/$YEAR/$MONTH/_index.svx" << EOF
---
title: "$MONTH_NAME $YEAR"
---

EOF
    echo "Created month index: $FEED_BASE/$YEAR/$MONTH/_index.svx"
fi

# Day index
if [ ! -f "$FEED_DIR/_index.svx" ]; then
    DAY_NAME=$(date -j -f "%Y-%m-%d" "$YEAR-$MONTH-$DAY" +"%B %d, %Y" 2>/dev/null || date -d "$YEAR-$MONTH-$DAY" +"%B %d, %Y" 2>/dev/null || echo "$YEAR-$MONTH-$DAY")
    cat > "$FEED_DIR/_index.svx" << EOF
---
title: "$DAY_NAME"
---

EOF
    echo "Created day index: $FEED_DIR/_index.svx"
fi

# Prompt for content (optional)
echo ""
echo "Enter content (optional, press Enter to skip and open in editor):"
read -r CONTENT_INPUT

# Prompt for tags (optional)
echo ""
echo "Enter tags (comma-separated, optional):"
read -r TAGS_INPUT

# Build tags array for frontmatter
TAGS_YAML=""
if [ -n "$TAGS_INPUT" ]; then
    TAGS_YAML="tags:"
    IFS=',' read -ra TAGS_ARRAY <<< "$TAGS_INPUT"
    for tag in "${TAGS_ARRAY[@]}"; do
        # Trim whitespace
        tag=$(echo "$tag" | xargs)
        if [ -n "$tag" ]; then
            TAGS_YAML="$TAGS_YAML
            - \"$tag\""
        fi
    done
fi

# Create the feed item file
cat > "$FEED_FILE" << EOF
---
title: "#$NEXT_NUM"
date: "$TIMESTAMP"
${TAGS_YAML}
---

${CONTENT_INPUT}
EOF

echo ""
echo "✅ Created new feed item: $FEED_FILE"
echo "📝 URL: /feed/$YEAR/$MONTH/$DAY/$NEXT_NUM/"
echo ""
echo "Opening in editor..."

# Open in default editor (falls back to vi if EDITOR not set)
${EDITOR:-vi} "$FEED_FILE"
