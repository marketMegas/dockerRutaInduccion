/**
 * Pruebas de las reglas de Firestore.
 *
 * Corre contra el emulador, nunca contra produccion: `npm run test:rules`
 * levanta el emulador con las reglas de ../firestore.rules y las exercise
 * con tokens reales del emulador de Auth.
 *
 * Que se prueben las reglas importa mas que el numero de casos: la coleccion
 * `calificaciones` la lee el navegador del estudiante con el SDK web, y la
 * unica barrera entre "mis notas" y "las notas de todos" es la regla que exige
 * que request.auth.uid coincida con el userId del documento.
 *
 * OJO con como falla una prueba cuando la regla esta mal: el emulador NO
 * devuelve un error de permisos (que seria lo comodo), sino un documento
 * vacio. Por eso los casos usan assertFails(), que convierte "me dejaron leer
 * algo que no debia" en un fallo explito. Sin eso, una regla abierta como
 * `allow read: if true` pasaria todas las pruebas.
 */
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { doc, getDoc, collection, getDocs, query, where, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const PROJECT_ID = 'plataforma-gmax';

const testEnv = initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: {
    rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
  },
});

const ALICE = 'uid-de-alice';
const BOB = 'uid-de-bob';

// El seed corre con privilegios de admin (no le aplican las reglas), que es
// como se escribe en la vida real: el backend, con el Admin SDK, no pasa por
// estas reglas.
async function seed() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'calificaciones', 'nota-alice'), {
      userId: ALICE,
      courseId: 'curso-1',
      courseName: 'PruebaCreacion28',
      percentage: 100,
      passed: true,
    });
    await setDoc(doc(db, 'calificaciones', 'nota-bob'), {
      userId: BOB,
      courseId: 'curso-2',
      courseName: 'Otro curso',
      percentage: 40,
      passed: false,
    });
  });
}

const contexto = (uid = null) =>
  testEnv.authenticatedContext(uid ? uid : ALICE, { email: `${uid}@test.com` }).firestore();

let fallos = 0;
async function prueba(nombre, fn) {
  try {
    await fn();
    console.log(`  ok    ${nombre}`);
  } catch (e) {
    fallos += 1;
    console.error(`  FALLA ${nombre}`);
    console.error(`        ${e.message.split('\n')[0]}`);
  }
}

try {
  await seed();

  console.log('\nLectura con sesion (regla principal):');

  await prueba('alumno lee su propia nota', async () => {
    const snap = await assertSucceeds(getDoc(doc(contexto(ALICE), 'calificaciones', 'nota-alice')));
    if (snap.data().percentage !== 100) throw new Error('leyo otra nota');
  });

  await prueba('alumno NO lee la nota de otro (el IDOR)', async () => {
    await assertFails(getDoc(doc(contexto(ALICE), 'calificaciones', 'nota-bob')));
  });

  await prueba('su query con where(userId == uid) devuelve solo lo suyo', async () => {
    const q = query(collection(contexto(ALICE), 'calificaciones'), where('userId', '==', ALICE));
    const snap = await assertSucceeds(getDocs(q));
    if (snap.size !== 1) throw new Error(`esperaba 1 documento, lw ${snap.size}`);
    if (snap.docs[0].data().userId !== ALICE) throw new Error('se leyo el documento de otro');
  });

  await prueba('NO puede leer la coleccion entera cambiando la query', async () => {
    // El ataque real: un alumno cambia el where por el uid de otro, o quita
    // el where para listarlo todo. Las reglas no filtran despues, asi que
    // esto tiene que denegarse.
    const q = query(collection(contexto(ALICE), 'calificaciones'), where('userId', '==', BOB));
    await assertFails(getDocs(q));

    const sinFiltro = query(collection(contexto(ALICE), 'calificaciones'));
    await assertFails(getDocs(sinFiltro));
  });

  console.log('\nSin sesion:');

  await prueba('anonimo NO lee ninguna nota', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, 'calificaciones', 'nota-alice')));
  });

  await prueba('anonimo NO lista la coleccion', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDocs(query(collection(anon, 'calificaciones'), where('userId', '==', ALICE))));
  });

  console.log('\nEscritura desde el cliente:');

  await prueba('NO puede crear una nota a su nombre', async () => {
    await assertFails(setDoc(doc(contexto(ALICE), 'calificaciones', 'falsa'), {
      userId: ALICE, courseId: 'curso-9', percentage: 100, passed: true,
    }));
  });

  await prueba('NO puede alterar su propia nota', async () => {
    await assertFails(updateDoc(doc(contexto(ALICE), 'calificaciones', 'nota-alice'), { percentage: 100 }));
  });

  await prueba('NO puede borrar su propia nota', async () => {
    await assertFails(deleteDoc(doc(contexto(ALICE), 'calificaciones', 'nota-alice')));
  });

  await prueba('NO puede escribir en la nota de otro', async () => {
    await assertFails(updateDoc(doc(contexto(BOB), 'calificaciones', 'nota-alice'), { passed: false }));
  });

  console.log('\nColecciones no declaradas:');

  await prueba('NO puede leer una coleccion nueva', async () => {
    await assertFails(getDocs(collection(contexto(ALICE), 'cualquier-cosa')));
  });
} finally {
  await testEnv.cleanup();
}

console.log(fallos === 0 ? '\nTodas las reglas se comportan como deben.\n' : `\n${fallos} prueba(s) fallaron.\n`);
process.exit(fallos === 0 ? 0 : 1);
