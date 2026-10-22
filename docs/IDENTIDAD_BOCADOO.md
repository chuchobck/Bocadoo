# Identidad Visual y Manual de Marca — Bocadoo

## 1. Paleta de Colores Oficial

| Token | Hex | Uso obligatorio |
|---|---|---|
| **Primary** | `#7B2CBF` | Acción principal por pantalla (máximo una rellena), acentos fuertes. |
| **Primary Hover** | `#6A22A9` | Estados hover y activos de botones primarios. |
| **Texto Principal** | `#4A0E78` | Títulos, saldos, números destacados, texto base (NUNCA negro puro `#000000`). |
| **Texto Secundario** | `#6B5B7B` | Metadatos, subtítulos cortos, etiquetas secundarias. |
| **Acento Lavanda** | `#E0AAFF` | Bordes activos, brillos, anillos de foco, chips seleccionados. |
| **Lila Suave** | `#F3E8FF` | Fondos de botones secundarios, tarjetas suaves, badges. |
| **Fondo de App** | `#F5F3FA` | Fondo general de todas las pantallas de comensal y dueño. |
| **Tarjetas** | `#FFFFFF` | Superficies de contenido y modales. |
| **Líneas y Bordes** | `#E7E1F2` | Separadores y contornos sutiles. |
| **Éxito (Validado)** | `#1F9D55` | Solo para almuerzos validados, cobrados, saldo activo (Fondo `#E6F6EC`, texto `#157A41`). |
| **Error / Peligro** | `#C0392B` | Solo para errores críticos, códigos vencidos o anulación (Fondo `#FDEBEB`, texto `#C0392B`). |

### Reglas Críticas de Color:
- **Degradados permitidos**: ÚNICAMENTE dentro de la gama morada: `#E0AAFF` → `#7B2CBF` → `#4A0E78`.
- **Sombras**: Siempre teñidas de morado (`rgba(74, 14, 120, 0.06)`, `0.10`, `0.18`), NUNCA negras.
- **Prohibido**: Fondos oscuros (`card-dark`, `#0A080E`, fondos negros en tarjetas o botones). La app es luminosa, limpia y moderna.
- **Un solo morado relleno**: Solo la acción principal por vista lleva fondo morado `#7B2CBF`. Las acciones secundarias van en blanco con borde o en lila suave `#F3E8FF`.

---

## 2. Tipografía y Escala
- **Familia**: `Plus Jakarta Sans`, pesos `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold), `800` (ExtraBold). Reemplaza a Outfit y browser defaults.
- **Mínimos de legibilidad**:
  - Metadatos y fechas: mínimo `13 px` (peso 600).
  - Texto de lectura y etiquetas: mínimo `15 px`.
  - Botones y acciones: mínimo `17 px` (peso 700 / 800).
  - Números protagonistas (saldo, total a cobrar, ticket): `32 px` a `48 px` (peso 800).
- **Prohibido**: `text-[7px]`, `text-[8px]`, `text-[9px]`, `text-[10px]`.

---

## 3. Radios y Formas
- **Botones**: Cápsula completa (`rounded-full` / `999px`). Alto mínimo en app `56 px` (en Caja `64 px`).
- **Tarjetas y Contenedores**: `rounded-[28px]` a `rounded-[32px]`.
- **Campos de Entrada (Inputs)**: `rounded-2xl` (`14–16 px`).

---

## 4. Tono, Vocabulario y Redacción
- **Regla de concisión**: 1 título de máximo 3 palabras, opcional 1 apoyo de máximo 8 palabras. Nada de párrafos explicativos.
- **Formato monetario**: Estilo Ecuador: `$2,75`, `$55,00`, `$0,00`.
- **Diccionario Permitido**:
  `Validado`, `Le quedan 19`, `Te quedan 14`, `Vence 30 oct`, `Último almuerzo`, `Sin almuerzos`, `Vencido`, `Es de otro local`, `Ya validado`, `Deshacer`, `Vender plan`, `Pasar cartulina`, `Guardar`, `Otra`, `Venta rápida`, `Cobrar $3,00`, `Efectivo`, `Transferencia`, `Para llevar`, `Comer aquí`, `Se acabó`, `Agotado`, `Repetir ayer`, `Publicar`, `Lleno`, `Libre`, `Movido`, `Cerrar caja`, `Cuadra`, `Faltan $3,00`, `Sobran $1,50`, `Almuerzos que debes`, `Quiero este`, `Paga en caja`, `Renovar`, `No fui yo`, `Devolver`, `Ahorras $5`, `Con amigos`, `Hoy en La Cuchara`, `Buscar restaurante`.
- **Palabras Prohibidas**:
  "suscripción", "transacción", "canje", "redención", "gestión", "módulo", "dashboard", "procesar", "ítem".
