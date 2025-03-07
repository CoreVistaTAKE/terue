#!/usr/bin/env bash
set -e

echo "=== Copying fonts.conf to /app/.apt/etc/fonts ==="
mkdir -p /app/.apt/etc/fonts
cp config/fonts.conf /app/.apt/etc/fonts/fonts.conf

echo "=== Updating font cache ==="
fc-cache -fv /app/.apt/usr/share/fonts

echo "Release script finished!"