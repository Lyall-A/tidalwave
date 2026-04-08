#!/bin/bash

os="${1:-unknown}"
target="${2:-bun}"
file_ext="$3"
archive_ext="${4:-.zip}"

build_dir=../build
bin_dir=../bin
out_dir=$build_dir/$os
filename=tidalwave
archive_name=tidalwave-$os

rm -rf "$out_dir"
mkdir -p "$out_dir"
cd ../src

bun build \
    --compile \
    --production \
    --target=$target \
    --define="isBuild=true" \
    --outfile="$out_dir/$filename$file_ext" \
    ./index.ts

cp ./default.config.json "$out_dir/config.json"
cp ../README.md "$out_dir/README.md"
cp ../LICENSE "$out_dir/LICENSE"
cp -r "$bin_dir/$os" "$out_dir/bin"
chmod +x "$out_dir/$filename$file_ext"

cp -r "$out_dir" "$build_dir/$archive_name"
if [[ "$archive_ext" == ".tar.gz" ]]; then
    7z a "$build_dir/$archive_name.tar" "$build_dir/$archive_name" -bso0
    7z a "$build_dir/$archive_name.tar.gz" "$build_dir/$archive_name.tar" -bso0
    rm "$build_dir/$archive_name.tar"
else
    7z a "$build_dir/$archive_name$archive_ext" "$build_dir/$archive_name" -bso0
fi
rm -rf "$build_dir/$archive_name"
