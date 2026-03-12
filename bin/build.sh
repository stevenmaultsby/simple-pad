#!/bin/sh
if web-ext --version; then
    echo "web-ext installed"
else
    npm i -G web-ext
fi
REACT_APP_MODULE="EXTENSION"
export REACT_APP_MODULE
echo $REACT_APP_MODULE
craco build
rm -rf dist
mkdir dist
cp -r build/* dist/
REACT_APP_MODULE="ADDON"
export REACT_APP_MODULE
echo $REACT_APP_MODULE
craco build
cp -r build/static/ dist/webpage_addon/
cd dist
web-ext build -o
cp web-ext-artifacts/* ../../simple-pad.zip
