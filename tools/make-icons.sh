#!/bin/sh
# Xuất icon PNG cho iPhone từ icons/icon.svg. Chạy: sh tools/make-icons.sh
set -e
cd "$(dirname "$0")/.."
node tools/make-icon.js
swift tools/svg2png.swift icons/icon.svg icons/icon-1024.png 1024
for s in 512 192 180; do
  sips -z $s $s icons/icon-1024.png --out icons/icon-$s.png >/dev/null
done
# iOS dùng ảnh không trong suốt cho icon màn hình chính
cp icons/icon-180.png icons/apple-touch-icon.png
echo "Xong: icons/icon-{1024,512,192,180}.png + apple-touch-icon.png"
