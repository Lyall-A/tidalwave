#!/bin/bash

ffmpeg_linux_x64_download_url=https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz
ffmpeg_linux_x64_download_extension=.tar.xz
ffmpeg_linux_x64_download_path=ffmpeg-linux-x64
ffmpeg_linux_x64_binary_path=ffmpeg-master-latest-linux64-gpl/bin/ffmpeg
ffmpeg_linux_x64_install_path=ffmpeg

ffmpeg_linux_arm64_download_url=https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linuxarm64-gpl.tar.xz
ffmpeg_linux_arm64_download_extension=.tar.xz
ffmpeg_linux_arm64_download_path=ffmpeg-linux-arm64
ffmpeg_linux_arm64_binary_path=ffmpeg-master-latest-linuxarm64-gpl/bin/ffmpeg
ffmpeg_linux_arm64_install_path=ffmpeg

ffmpeg_windows_x64_download_url=https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip
ffmpeg_windows_x64_download_extension=.zip
ffmpeg_windows_x64_download_path=ffmpeg-windows-x64
ffmpeg_windows_x64_binary_path=ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe
ffmpeg_windows_x64_install_path=ffmpeg.exe

ffmpeg_macos_x64_download_url=https://evermeet.cx/ffmpeg/get/ffmpeg/7z
ffmpeg_macos_x64_download_extension=.7z
ffmpeg_macos_x64_download_path=ffmpeg-macos-x64
ffmpeg_macos_x64_binary_path=ffmpeg
ffmpeg_macos_x64_install_path=ffmpeg

cd ..
mkdir -p bin && cd bin
mkdir -p linux-x64 linux-arm64 windows-x64 macos-x64 macos-arm64

setup_ffmpeg() {
    local platform=$1
    local arch=$2

    local download_url="ffmpeg_${platform,,}_${arch,,}_download_url"
    local download_extension="ffmpeg_${platform,,}_${arch,,}_download_extension"
    local download_path="ffmpeg_${platform,,}_${arch,,}_download_path"
    local binary_path="ffmpeg_${platform,,}_${arch,,}_binary_path"
    local install_path="ffmpeg_${platform,,}_${arch,,}_install_path"

    echo "Downloading FFmpeg for ${platform} (${arch})..."
    curl -L --create-dirs -o ${!download_path}${!download_extension} ${!download_url}

    echo "Extracting FFmpeg for ${platform} (${arch})..."
    if [[ ${!download_extension} == .tar.xz ]]; then
      7z x ${!download_path}${!download_extension}
      7z x ${!download_path}.tar -o${!download_path}
    else
      7z x ${!download_path}${!download_extension} -o${!download_path}
    fi

    echo "Installing FFmpeg for ${platform} (${arch})..."
    install -m 700 ${!download_path}/${!binary_path} ${platform,,}-${arch,,}/${!install_path}

    echo "Cleaning up FFmpeg for ${platform} (${arch})..."
    rm ${!download_path}${!download_extension}
    if [[ ${!download_extension} == .tar.xz ]]; then
      rm ${!download_path}.tar
    fi
    rm -r ${!download_path}
}

setup_ffmpeg Linux x64
setup_ffmpeg Linux arm64
setup_ffmpeg Windows x64
setup_ffmpeg macOS x64

echo "Installing FFmpeg for macOS (arm64)"
cp -p macos-x64/${ffmpeg_macos_x64_install_path} macos-arm64/${ffmpeg_macos_arm64_install_path}