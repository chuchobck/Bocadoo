## Antes de tocar la UI

1. Lee **COMPLETO** [`docs/IDENTIDAD_BOCADOO.md`](docs/IDENTIDAD_BOCADOO.md): paleta (claro y oscuro), tipografía, formas y tono.
2. Usa **solo los tokens de `src/styles.css`** (`bg-surface`, `text-foreground`, `bg-primary-container`, `shadow-brand`…). **Nunca hex sueltos**, `rgb()`, `bg-white` ni `text-black`; la única excepción son los colores del QR (`src/lib/qr-colors.ts`). `npm run lint:brand` lo verifica.
3. **Prueba cada cambio en modo claro y oscuro** (Ajustes → Apariencia, o el botón sol/luna de la landing). Comprueba que todo texto tenga contraste ≥ 4,5:1 y los bordes de inputs ≥ 3:1.

---

# Inspo Palette Creation

te paso la inspo en fotos, y vamos a usar esa paleta de colores que te mandé, ahora si crea

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/53ef747a-c04d-4ff5-a83c-8976c93e2b26).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
