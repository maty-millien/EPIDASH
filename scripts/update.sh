#!/bin/bash
set -e

UPDATE_PATH="$1"
APP_PATH="$2"
APP_NAME="EPIDASH"

sleep 2

OS=$(uname -s)

case "$OS" in
  Darwin)
    TMPDIR=$(mktemp -d)
    ditto -xk "$UPDATE_PATH" "$TMPDIR"
    rm -rf "$APP_PATH"
    mv "$TMPDIR/$APP_NAME.app" "$APP_PATH"
    rm -rf "$TMPDIR"
    xattr -cr "$APP_PATH"
    open -a "$APP_PATH"
    ;;
  Linux)
    if [[ "$UPDATE_PATH" == *.deb ]] && command -v dpkg &> /dev/null; then
      pkexec dpkg -i "$UPDATE_PATH" || sudo dpkg -i "$UPDATE_PATH"
      nohup epidash > /dev/null 2>&1 &
    elif [[ "$UPDATE_PATH" == *.rpm ]] && command -v rpm &> /dev/null; then
      pkexec rpm -U "$UPDATE_PATH" || sudo rpm -U "$UPDATE_PATH"
      nohup epidash > /dev/null 2>&1 &
    else
      xdg-open "https://github.com/maty-millien/EPIDASH/releases/latest"
    fi
    ;;
esac
