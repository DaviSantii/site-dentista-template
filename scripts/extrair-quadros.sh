#!/usr/bin/env bash
# Extrai os quadros de uma sequência de rolagem.
#
# Uso: bash scripts/extrair-quadros.sh <video> <nome> [quadros] [foco_x] [inicio_s] [fim_s]
#   nome     pasta de saída em public/frames/<nome>
#   quadros  total desejado (padrão 150)
#   foco_x   0 a 1, centro horizontal do recorte do celular (padrão 0.5)
#
# O ffmpeg usado pode ser trocado pela variável FFMPEG (padrão: ffmpeg no PATH).
# Exemplo: FFMPEG=/c/ferramentas/ffmpeg.exe npm run quadros -- fonte/video.mp4 hero 150 0.71
set -euo pipefail

FF="${FFMPEG:-ffmpeg}"
IN="$1"; NOME="$2"; N="${3:-150}"; FOCO="${4:-0.5}"; INI="${5:-0}"; FIM="${6:-}"
OUT="public/frames/$NOME"
rm -rf "$OUT" && mkdir -p "$OUT/desktop" "$OUT/mobile" public/img

# duração lida da saída do próprio ffmpeg, para não depender do ffprobe
DUR=$("$FF" -hide_banner -i "$IN" 2>&1 | awk -F'[:, ]+' '/Duration/ {print $3*3600 + $4*60 + $5; exit}' || true)
if [ -n "$FIM" ]; then DUR=$(awk "BEGIN{print $FIM-$INI}"); else DUR=$(awk "BEGIN{print $DUR-$INI}"); fi
FPS=$(awk "BEGIN{printf \"%.4f\", $N/$DUR}")
CORTE=(-ss "$INI"); if [ -n "$FIM" ]; then CORTE+=(-to "$FIM"); fi

# os vídeos de origem têm uma faixa preta de 3 px no topo e na base: os 4 px de cada lado saem antes de tudo
# desktop: largura original até 1920, sem ampliar
"$FF" -v error "${CORTE[@]}" -i "$IN" -an \
  -vf "fps=$FPS,crop=iw:ih-8:0:4,scale='min(1920,iw)':-2:flags=lanczos" -frames:v "$N" \
  -c:v libwebp -quality 78 -compression_level 6 "$OUT/desktop/%04d.webp"

# celular: recorte quase quadrado (8:9) centrado no foco, na resolução original.
# No celular o quadro é desenhado pela largura, com o texto abaixo, então o
# assunto inteiro precisa caber no recorte.
"$FF" -v error "${CORTE[@]}" -i "$IN" -an \
  -vf "fps=$FPS,crop=iw:ih-8:0:4,crop='min(iw,ih*8/9)':ih:'(iw-min(iw,ih*8/9))*$FOCO':0" -frames:v "$N" \
  -c:v libwebp -quality 74 -compression_level 6 "$OUT/mobile/%04d.webp"

cp "$OUT/desktop/0001.webp" "public/img/$NOME-inicio.webp"
cp "$OUT/mobile/0001.webp" "public/img/$NOME-inicio-mobile.webp"
cp "$OUT/desktop/$(printf %04d "$N").webp" "public/img/$NOME-fim.webp"
cp "$OUT/mobile/$(printf %04d "$N").webp" "public/img/$NOME-fim-mobile.webp"

echo "quadros desktop: $(ls "$OUT/desktop" | wc -l) de $N"
du -sh "$OUT/desktop" "$OUT/mobile"
