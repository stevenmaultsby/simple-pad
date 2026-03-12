#!/bin/sh
REACT_APP_MODULE="ADDON"
export REACT_APP_MODULE
echo $REACT_APP_MODULE
craco build
craco start
