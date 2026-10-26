# Instrucciones para agentes

Reglas de trabajo del repositorio. `AGENTS.md` apunta a este archivo.

## Commits: Conventional Commits (obligatorio)

Todo commit debe respetar el formato de [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>: <verbo en infinitivo> <qué se hizo>

<cuerpo opcional>

<footer opcional>
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad visible para el usuario |
| `fix` | Corrección de un bug |
| `perf` | Mejora de rendimiento sin cambiar el comportamiento |
| `refactor` | Cambio interno sin cambio funcional |
| `docs` | Solo documentación |
| `test` | Tests o fixtures |
| `build` | Build, dependencias, lockfile, `next.config.ts` |
| `ci` | CI/CD (GitHub Actions, Vercel config) |
| `chore` | Mantenimiento: scripts, configuración, `.gitignore` |
| `style` | Formato/estilo sin cambio de lógica |
| `revert` | Revertir un commit anterior |

### Reglas

1. **Un commit = un cambio lógico.** No mezclar `perf` + `build` + `docs` en el mismo commit; dividir por tipo/ámbito.
2. **Descripción con verbo.** Después de `<tipo>:` el mensaje empieza siempre con un **verbo en infinitivo**: `actualizar`, `agregar`, `corregir`, `mejorar`, `eliminar`, `documentar`, `mover`, `renombrar`, `evitar`, `permitir`… En minúscula inicial, sin punto final y ≤ 72 caracteres. No usar sustantivos ni frases nominales (`actualización de…`, `mejoras varias`, `cambios en…`).
3. **Ámbito**: no se usa por defecto (formato `tipo: verbo …`). Si aporta contexto, va en minúsculas entre paréntesis y la descripción igual empieza con verbo: `fix(api): validar el precio antes de guardar`.
4. **Cuerpo** separado por una línea en blanco. Explicar **qué** y **por qué**, no repetir el diff. Viñetas con `-`, líneas ≤ 100 caracteres.
5. **Breaking change**: `!` antes de los dos puntos (`feat!: ...` o `feat(api)!: ...`) y footer `BREAKING CHANGE: <descripción>`.
6. **Referencias** en el footer cuando existan: `Closes #123`, `Refs #456`.
7. **Idioma**: español (como el resto del repo); `tipo` y `ámbito` se mantienen en inglés.
8. **Nunca** commitear secretos (`.env*`, credenciales, tokens), artefactos (`.next/`, `.playwright-mcp/`, `.screenshots/`, `*.tsbuildinfo`) ni `node_modules/`.
9. **No** usar `--no-verify` ni `--amend` sobre commits ya pusheados.
10. Antes de commitear, mostrar el mensaje propuesto y esperar confirmación del humano cuando lo pida.

### Ejemplos

Correctos:

```
chore: actualizar next js a la versión 16.4.3
perf: mostrar skeleton al navegar a la ficha
fix: evitar imágenes duplicadas al paginar
docs: documentar el formato de commits
feat!: exigir autenticación en POST /api/listings

BREAKING CHANGE: el endpoint ahora responde 401 sin sesión.
```

Incorrectos:

```
update code                          # sin tipo
Fix: Arreglé el bug.                 # mayúscula, punto final, sin verbo
chore: actualización de dependencias # sustantivo, no verbo
perf: cambios varios                 # no describe una acción
```
