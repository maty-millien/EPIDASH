#!/bin/bash
set -e

REPO="maty-millien/EPIDASH"
APP_NAME="EPIDASH"

echo "Installing $APP_NAME..."

OS=$(uname -s)
ARCH=$(uname -m)

case "$ARCH" in
  x86_64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

LATEST=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$LATEST" ]; then
  echo "Failed to fetch latest release"
  exit 1
fi

echo "Latest version: $LATEST"

case "$OS" in
  Darwin)
    ASSET="$APP_NAME-darwin-$ARCH-${LATEST#v}.zip"
    URL="https://github.com/$REPO/releases/download/$LATEST/$ASSET"

    echo "Downloading $ASSET..."
    TMPDIR=$(mktemp -d)
    curl -fsSL "$URL" -o "$TMPDIR/$ASSET"

    echo "Installing to /Applications..."
    unzip -q "$TMPDIR/$ASSET" -d "$TMPDIR"

    if [ -d "/Applications/$APP_NAME.app" ]; then
      rm -rf "/Applications/$APP_NAME.app"
    fi

    mv "$TMPDIR/$APP_NAME.app" /Applications/
    rm -rf "$TMPDIR"

    echo "✓ $APP_NAME installed to /Applications"
    echo "  Run: open /Applications/$APP_NAME.app"
    ;;

  Linux)
    if command -v dpkg &> /dev/null; then
      ASSET="${APP_NAME,,}_${LATEST#v}_$ARCH.deb"
      URL="https://github.com/$REPO/releases/download/$LATEST/$ASSET"

      echo "Downloading $ASSET..."
      TMPFILE=$(mktemp)
      curl -fsSL "$URL" -o "$TMPFILE"

      echo "Installing (requires sudo)..."
      sudo dpkg -i "$TMPFILE"
      rm "$TMPFILE"

      echo "✓ $APP_NAME installed"

    elif command -v rpm &> /dev/null; then
      ASSET="${APP_NAME,,}-${LATEST#v}.$ARCH.rpm"
      URL="https://github.com/$REPO/releases/download/$LATEST/$ASSET"

      echo "Downloading $ASSET..."
      TMPFILE=$(mktemp)
      curl -fsSL "$URL" -o "$TMPFILE"

      echo "Installing (requires sudo)..."
      sudo rpm -i "$TMPFILE"
      rm "$TMPFILE"

      echo "✓ $APP_NAME installed"

    else
      echo "No supported package manager found (dpkg or rpm)"
      exit 1
    fi
    ;;

  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac
