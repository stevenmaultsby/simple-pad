#!/bin/bash

set -e

MANIFEST=/usr/local/apache2/htdocs/manifest.js

if [[ ! -f $MANIFEST ]]; then
  echo "Manifest file does not exist. Using stdout instead."
  MANIFEST=/dev/stdout
fi

echo "window.__FAMMANIFEST = {" > $MANIFEST
env | grep REACT_APP | while read line; do
  keyval=`echo $line | sed -r "0,/=/s// /"`
  key=`echo $keyval | awk '{ print $1 }'`
  val=`echo $keyval | sed -r "s/^$key\\s//"`
  escapedVal=`echo $val | tr '"' '\"'`
  echo "  \"$key\": \"$escapedVal\"," >> $MANIFEST
done
echo "};" >> $MANIFEST
exec /usr/local/apache2/bin/httpd -D FOREGROUND

