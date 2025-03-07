#!/usr/bin/env bash
set -e

echo "=== Copying fonts.conf ==="
mkdir -p /app/.apt/etc/fonts
cp config/fonts.conf /app/.apt/etc/fonts/fonts.conf

echo "=== Running fc-cache ==="
fc-cache -fv /app/.apt/usr/share/fonts