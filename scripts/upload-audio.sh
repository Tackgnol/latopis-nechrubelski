#!/usr/bin/env bash
# Transcodes Psalmy/ to AAC-LC mono .m4a (<variant>/<psalm>-<verse>.m4a) and
# replaces /var/www/miseries/audio on the VM with it, in a single ssh call.
# Usage: scripts/upload-audio.sh [ssh-host]   (default: oracle)
set -euo pipefail

host="${1:-oracle}"
src="$(cd "$(dirname "$0")/.." && pwd)/Psalmy"
out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT

find "$src" -name '*.opus' -print0 | while IFS= read -r -d '' f; do
  read -r _ psalm verse variant alt <<<"$(basename "$f" .opus)"
  # Psalm VII's variant A is the (alt) take; the plain A recording is not served.
  if [[ $psalm == 7 && $variant == A && -z $alt ]]; then continue; fi
  mkdir -p "$out/$variant"
  ffmpeg -nostdin -loglevel error -y -i "$f" -vn -ac 1 -c:a aac -b:a 64k "$out/$variant/$psalm-$verse.m4a"
done

count="$(find "$out" -name '*.m4a' | wc -l)"
if [[ $count -ne 148 ]]; then
  echo "expected 148 files (6 psalms x 6 verses x 4 variants + 4 for 7:7), got $count" >&2
  exit 1
fi

tar -C "$out" -cf - . | ssh "$host" '
  set -e
  cd /var/www/miseries
  rm -rf audio.new audio.old
  mkdir audio.new
  tar -C audio.new -xf -
  chmod -R u=rwX,go=rX audio.new
  if [ -d audio ]; then mv audio audio.old; fi
  mv audio.new audio
  rm -rf audio.old
'
echo "uploaded $count files to $host:/var/www/miseries/audio"
