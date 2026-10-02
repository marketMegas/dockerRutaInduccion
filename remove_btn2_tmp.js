const fs = require('fs');
const p = 'frontend/src/pages/CursoLeccionPage.jsx';
const s0 = fs.readFileSync(p, 'utf8');

// Único: el comentario de la sección "2. Título principal" solo aparece una vez.
const titleComment = '        {/* 2. Título principal */}';
if (s0.split(titleComment).length - 1 !== 1) {
  console.error('title_comment_count_unexpected');
  process.exit(1);
}

const start = [
  titleComment,
  '        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">',
].join('\r\n') + '\r\n';

const idx = s0.indexOf(start);
if (idx === -1) { console.error('start_not_found'); process.exit(1); }

// El wrapper del título no contiene otros <div>, así que el primer
// '\r\n        </div>' (8 espacios) después del inicio es su cierre.
const closeNeedle = '\r\n' + '        </div>';
const closeIdx = s0.indexOf(closeNeedle, idx + start.length);
if (closeIdx === -1) { console.error('close_not_found'); process.exit(1); }

const blockEnd = closeIdx + closeNeedle.length;
const oldBlock = s0.slice(idx, blockEnd);

if (!oldBlock.includes('Marcar como completada')) { console.error('block_missing_label'); process.exit(1); }
if (oldBlock.includes('Reproductor')) { console.error('block_too_long'); process.exit(1); }
if (!oldBlock.includes('Finalizar Curso')) { console.error('block_missing_finalize'); process.exit(1); }

const newBlock = [
  titleComment,
  '        <h1 className="text-3xl font-bold text-gray-900 leading-tight">',
  "          {currentLesson.id}. {currentLesson.title.replace(/^\\d+\\.\\s*/, '')}",
  '        </h1>',
].join('\r\n');

const out = s0.slice(0, idx) + newBlock + s0.slice(blockEnd);
fs.writeFileSync(p, out, 'utf8');
console.log('ok_removed');
