#!/bin/bash
if [ -d "dependencies" ]; 
  then
    echo "Dependencies already installed."
  else
    mkdir dependencies 
    cd dependencies
    curl -o ffmpeg_build.tar.xz http://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz 
    tar xf ffmpeg_build.tar.xz
    rm ffmpeg_build.tar.xz

    for f in "$PWD"/*
    do
	if [ -d "$f" ]
	then
		mv $f "$PWD/ffmpeg"
	fi
    done
    cd ..
fi

if [ -d "tmp" ]; 
  then
    echo "Temporary folder already created."
  else
    mkdir tmp
    cd tmp
    mkdir gifs
    cd ..
    cd ..
fi


