#!/usr/bin/env bash
# Extrai uma imagem parada por etapa, em versão desktop e celular.
#
# Uso: bash scripts/extrair-etapas.sh <video> <nome> <foco_x> <segundo> [segundo ...]
#   nome     prefixo dos arquivos: public/img/<nome>-1.webp, <nome>-1-mobile.webp, ...
#   foco_x   0 a 1, centro horizontal do recorte do celular
#   segundo  instante do vídeo de cada etapa, em ordem
#
# O ffmpeg usado pode ser trocado pela variável FFMPEG (padrão: ffmpeg no PATH).
# Exemplo: npm run etapas -- fonte/video.mp4 forma 0.85 0 3.875 7.85
set -euo pipefail

FF="${FFMPEG:-ffmpeg}"
IN="$1"; NOME="$2"; FOCO="$3"; shift 3
mkdir -p public/img

# os vídeos de origem têm uma faixa preta de 3 px no topo e na base: os 4 px de cada lado saem antes de tudo
LIMPA="crop=iw:ih-8:0:4"
DESK="$LIMPA,scale='min(1920,iw)':-2:flags=lanczos"
MOB="$LIMPA,crop='min(iw,ih*8/9)':ih:'(iw-min(iw,ih*8/9))*$FOCO':0"

K=1
for T in "$@"; do
  "$FF" -v error -y -ss "$T" -i "$IN" -frames:v 1 -vf "$DESK" -c:v libwebp -quality 86 "public/img/$NOME-$K.webp"
  "$FF" -v error -y -ss "$T" -i "$IN" -frames:v 1 -vf "$MOB" -c:v libwebp -quality 84 "public/img/$NOME-$K-mobile.webp"
  K=$((K + 1))
done

du -h public/img/$NOME-*
