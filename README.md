# HydroSolve 🌊

> **Laboratorio Digital Interactivo de Métodos Numéricos e Hidráulica de Canales**<br>
> Resolución analítico-numérica del tirante normal en canales trapezoidales mediante la ecuación de Manning, simulación paso a paso con el método de **Falsa Posición** (*Regula Falsi*) y contrastación algorítmica con **Bisección** y **Newton-Raphson**.

🔗 **Sitio web en producción:** [https://hydrosolve.usco.cloud/](https://hydrosolve.usco.cloud/)

---

## 📌 Descripción

**HydroSolve** es una aplicación web interactiva diseñada para la enseñanza, experimentación y análisis riguroso de Métodos Numéricos aplicados a la Ingeniería Civil.

En hidráulica a superficie libre, el **tirante normal** ($y_n$) es la profundidad de flujo en régimen uniforme permanente que equilibra la componente gravitacional del peso del agua con las fuerzas resistentes por fricción contra las paredes y el fondo del canal. El gasto volumétrico se determina mediante la **ecuación de Manning**:

$$Q = \frac{1}{n} A R^{2/3} \sqrt{S}$$

Para secciones transversales trapezoidales, tanto el área mojada $A(y) = y(b + zy)$ como el radio hidráulico $R(y) = A(y)/P(y)$ dependen del tirante con exponentes fraccionarios ($5/3$ y $2/3$), lo que impide un despeje algebraico directo de la incógnita $y$. Por ello, el problema se formula como una función residual no lineal:

$$f(y) = \frac{\sqrt{S}}{n} \cdot \frac{\left[y(b + zy)\right]^{5/3}}{\left[b + 2y\sqrt{1 + z^2}\right]^{2/3}} - Q = 0$$

HydroSolve implementa el método de **Falsa Posición** para aproximar la raíz positiva de $f(y) = 0$, complementándolo con un simulador interactivo paso a paso, visualización geométrica del canal en SVG a escala, gráficas de la recta secante en tiempo real, seguimiento del error relativo aproximado ($\varepsilon_a$) y contrastación paralela con otros solucionadores numéricos.

---

## ⚙️ Características Principales

* **Cálculo Numérico con Falsa Posición (Regula Falsi):** Interpolación lineal por recta secante entre los extremos $[a, b]$, garantizando la existencia de la raíz conforme al Teorema de Bolzano ($f(a) \cdot f(b) < 0$).
* **Simulador Interactivo con Control Temporal:** Controles de navegación (*Play*, *Pausa*, paso a paso adelante/atrás, salto al final) y ajuste de velocidad (0.5s a 2.0s por iteración) para analizar detalladamente cada aproximación.
* **Geometría Dinámica en SVG:** Renderizado paramétrico a escala del canal trapezoidal que actualiza en tiempo real el tirante de agua ($y$), el ancho de solera ($b$), el talud ($z$) y el espejo superficial ($T$).
* **Gráfica de la Función Hidráulica y Recta Secante:** Representación interactiva de la curva $f(y)$ junto con la secante de cada iteración, ilustrando la proyección geométrica de la raíz estimada $x_r$ sobre el eje de abscisas.
* **Curva de Convergencia del Error:** Gráfica de decaimiento del error relativo aproximado ($\varepsilon_a$) frente a la tolerancia porcentual programada ($\varepsilon_s$).
* **Comparativa Multimétodo Simultánea:** Ejecución concurrente del problema contra los métodos de **Bisección** (convergencia lineal) y **Newton-Raphson** (convergencia cuadrática con derivada analítica), contrastando número de iteraciones, residuos y tiempos de cómputo.
* **Desarrollo Matemático Guiado en 15 Pasos:** Panel analítico que desglosa en tiempo real la sustitución numérica de las fórmulas hidráulicas y geométricas evaluadas con KaTeX.
* **Validación Física y Asistente de Intervalos:** Comprobación rigurosa de parámetros de entrada ($Q, b, S, n, a, b_0 > 0$) con detección de intervalos sin cambio de signo y sugerencia algorítmica de cotas válidas.
* **Exportación de Datos a CSV:** Descarga del historial iterativo completo con valores de precisión de punto flotante para su análisis externo en hojas de cálculo o entornos de programación.

---

## 📐 Fundamento Matemático

### 1. Geometría de la Sección Trapezoidal

Para un canal con ancho de fondo $b$, talud lateral $z$ ($\text{H:1V}$) y tirante $y$:

| Propiedad | Símbolo | Expresión Analítica | Unidades |
| :--- | :---: | :---: | :---: |
| **Espejo de agua (ancho superficial)** | $T(y)$ | $b + 2zy$ | $\text{m}$ |
| **Área hidráulica (mojada)** | $A(y)$ | $y(b + zy)$ | $\text{m}^2$ |
| **Perímetro mojado** | $P(y)$ | $b + 2y\sqrt{1 + z^2}$ | $\text{m}$ |
| **Radio hidráulico** | $R(y)$ | $\frac{A(y)}{P(y)} = \frac{y(b + zy)}{b + 2y\sqrt{1 + z^2}}$ | $\text{m}$ |
| **Tirante hidráulico** | $D_h(y)$ | $\frac{A(y)}{T(y)} = \frac{y(b + zy)}{b + 2zy}$ | $\text{m}$ |

### 2. Algoritmo de Falsa Posición (Regula Falsi)

A partir de dos extremos iniciales $[a, b]$ que encierran la raíz ($f(a) \cdot f(b) < 0$), la aproximación por recta secante se calcula como:

$$x_r = b - \frac{f(b)(a - b)}{f(a) - f(b)} = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)}$$

#### Actualización del Intervalo:
* Si $f(a) \cdot f(x_r) < 0$: la raíz se ubica en $[a, x_r] \implies b \leftarrow x_r$.
* Si $f(b) \cdot f(x_r) < 0$: la raíz se ubica en $[x_r, b] \implies a \leftarrow x_r$.

#### Criterio de Parada y Error Relativo Aproximado:
$$\varepsilon_a = \left| \frac{x_{r,i} - x_{r,i-1}}{x_{r,i}} \right| \times 100\% \quad (i \ge 2)$$

> **Nota de rigor numérico:** En la primera iteración ($i = 1$) no existe una aproximación precedente $x_{r,0}$, por lo que $\varepsilon_a$ se define formalmente como **N/A** (no cero), evitando falsos reportes de convergencia instantánea.

### 3. Caso Base de Referencia

Evaluación con los parámetros predeterminados de la aplicación:

* **Datos de diseño:** $Q = 12,00\text{ m}^3/\text{s}$, $b = 3,00\text{ m}$, $z = 1,50$, $S = 0,001\text{ m/m}$, $n = 0,025\text{ s/m}^{1/3}$, intervalo inicial $[1,00, 2,00]\text{ m}$, tolerancia $\varepsilon_s = 0,01\%$.
* **Tirante normal calculado:** **$y_n = 1,68594\text{ m}$** ($\approx 1,686\text{ m}$).
* **Iteraciones requeridas:** 5 pasos ($\varepsilon_a = 0,0038\% \le 0,01\%$).
* **Propiedades de flujo en $y_n$:** Área $A = 9,321\text{ m}^2$, perímetro $P = 9,079\text{ m}$, radio hidráulico $R = 1,027\text{ m}$, velocidad media $V = 1,287\text{ m/s}$, número de Froude $Fr = 0,382$ (régimen subcrítico, $y_n > y_c = 1,065\text{ m}$).

---

## 💻 Instalación y Ejecución Local

### Requisitos Previos

* **Node.js:** Versión 18.x o superior (Node.js 20 LTS recomendado).
* **npm:** Gestor de paquetes incluido con Node.js (versión 10+).

### Procedimiento Paso a Paso

```bash
# 1. Clonar el repositorio
git clone https://github.com/Maurxp/HydroSolve.git
cd HydroSolve

# 2. Instalar las dependencias del proyecto
npm install

# 3. Iniciar el servidor de desarrollo local
npm run dev
```

La aplicación estará disponible de forma inmediata en el navegador en `http://localhost:5173/`.

---

## 🛠️ Comandos Disponibles

El proyecto cuenta con los siguientes scripts definidos en `package.json`:

| Comando | Acción | Descripción |
| :--- | :--- | :--- |
| `npm run dev` | Servidor de desarrollo | Inicia Vite con recarga de módulos en caliente (*Hot Module Replacement*). |
| `npm run build` | Compilación para producción | Ejecuta la comprobación estricta de tipos de TypeScript (`tsc -b`) y empaqueta la aplicación en `dist/`. |
| `npm run preview` | Previsualización local | Sirve localmente los archivos compilados de `dist/` para verificar el comportamiento de producción. |
| `npm run test` | Pruebas unitarias | Ejecuta la batería completa de pruebas automatizadas con Vitest en modo de ejecución única (*run*). |
| `npm run test:watch` | Pruebas interactivas | Inicia Vitest en modo interactivo con recarga automática ante cambios en el código. |
| `npm run lint` | Análisis estático | Inspecciona el código con Oxlint asegurando el cumplimiento de reglas de React Hooks y TypeScript. |

---

## 🧪 Pruebas y Calidad de Código

HydroSolve integra una arquitectura de pruebas automatizadas con **Vitest** y análisis estático con **Oxlint**:

* **Pruebas del Modelo Hidráulico (`tests/hydraulics.test.ts` — 11 pruebas):**
  * Verificación de fórmulas de área, perímetro mojado, ancho superficial y radio hidráulico.
  * Evaluación de la descarga de Manning y comprobación del Teorema de Bolzano en el intervalo de búsqueda.
  * Comparación de la derivada analítica frente a aproximación por diferencias finitas centradas.
  * Cálculo del tirante crítico con condición de Froude unitario ($Fr = 1$).
  * Validación de restricciones físicas y detección de intervalos sin cambio de signo.

* **Pruebas de Métodos Numéricos (`tests/regulaFalsi.test.ts` — 8 pruebas):**
  * Convergencia del método de falsa posición en el caso base de ingeniería civil.
  * Comprobación del error $\varepsilon_a$ como `null` en la primera iteración y cálculo correcto en pasos subsecuentes.
  * Cumplimiento estricto del criterio de parada por tolerancia ($\varepsilon_a \le \varepsilon_s$).
  * Contrastación contra el solucionador de referencia independiente de alta precisión (bisección a 100 iteraciones).
  * Manejo seguro de casos límite: intervalos sin cambio de signo y raíces exactas en los extremos.
  * Comparación de convergencia cruzada con Bisección y Newton-Raphson.

Para ejecutar la suite completa de pruebas:

```bash
npm run test
```

---

## 📂 Estructura del Proyecto

El siguiente árbol describe la arquitectura real y organizada del repositorio:

```text
HydroSolve/
├── docs/                           # Documentación técnica, académica y guías
│   ├── DESPLIEGUE.md               # Guía de hosting estático (Cloudflare Pages y Netlify)
│   ├── INFORME_ACADEMICO.md        # Memoria formal del proyecto de Métodos Numéricos
│   └── METODO_NUMERICO.md          # Deducción algorítmica y comparativa de convergencia
├── public/                         # Activos estáticos servidos directamente
│   ├── favicon.svg                 # Icono vectorial de la aplicación
│   └── icons.svg                   # Sprite de iconos SVG
├── src/                            # Código fuente de la aplicación
│   ├── assets/                     # Recursos gráficos locales
│   │   ├── hero.png                # Gráfico ilustrativo de plataforma
│   │   ├── react.svg               # Icono de React
│   │   └── vite.svg                # Icono de Vite
│   ├── components/                 # Componentes modulares de interfaz
│   │   ├── channel/                # Renderizado interactivo del canal trapezoidal
│   │   │   └── ChannelVisualizer.tsx
│   │   ├── charts/                 # Gráficas dinámicas de funciones y convergencia
│   │   │   ├── ConvergenceChart.tsx
│   │   │   └── HydraulicFunctionChart.tsx
│   │   ├── common/                 # Componentes reutilizables de UI y fórmulas
│   │   │   ├── Badge.tsx
│   │   │   └── MathFormula.tsx
│   │   ├── comparison/             # Comparativa simultánea entre métodos numéricos
│   │   │   └── MethodComparison.tsx
│   │   ├── forms/                  # Formulario y controles de parámetros hidráulicos
│   │   │   └── ParameterForm.tsx
│   │   ├── results/                # Dashboard de diagnóstico y régimen hidráulico
│   │   │   └── ResultsDashboard.tsx
│   │   ├── simulator/              # Controles paso a paso y tabla iterativa
│   │   │   ├── IterationSimulator.tsx
│   │   │   ├── IterationSummaryCard.tsx
│   │   │   └── NumericalTable.tsx
│   │   ├── steps/                  # Desglose matemático guiado en 15 pasos
│   │   │   └── StepByStepMath.tsx
│   │   └── theory/                 # Guía teórica interactiva y fórmulas base
│   │       └── TheoreticalGuide.tsx
│   ├── hydraulics/                 # Modelo hidráulico y validadores de diseño
│   │   ├── channel.ts              # Ecuaciones de Manning, áreas y propiedades de flujo
│   │   └── validator.ts            # Validación física e inferencia de intervalos
│   ├── math/                       # Algoritmos numéricos de búsqueda de raíces
│   │   ├── bisection.ts            # Método de bisección
│   │   ├── newtonRaphson.ts        # Método de Newton-Raphson con derivada analítica
│   │   ├── referenceSolver.ts      # Solucionador independiente de alta precisión (100 it.)
│   │   └── regulaFalsi.ts          # Algoritmo principal de Falsa Posición (Regula Falsi)
│   ├── sections/                   # Secciones estructurales de la página
│   │   ├── Footer.tsx              # Pie de página y créditos académicos
│   │   └── HeroSection.tsx         # Encabezado principal y presentación del laboratorio
│   ├── styles/                     # Sistema de diseño y hojas de estilos
│   │   ├── index.css               # Estilos globales y temas visuales
│   │   └── tokens.css              # Variables CSS y tokens de diseño
│   ├── types/                      # Definiciones de tipos TypeScript
│   │   ├── hydraulics.ts           # Interfaces de parámetros y propiedades hidráulicas
│   │   └── numerical.ts            # Tipos de iteraciones y estados de convergencia
│   ├── utils/                      # Funciones auxiliares
│   │   ├── csvExport.ts            # Exportador de historial de iteraciones a CSV
│   │   └── formatters.ts           # Formato de números y notación científica
│   ├── App.css                     # Estilos complementarios de la aplicación
│   ├── App.tsx                     # Componente raíz y orquestador del estado general
│   ├── index.css                   # Importación de fuentes KaTeX y estilos base
│   └── main.tsx                    # Punto de entrada de React en el DOM
├── tests/                          # Suite de pruebas automatizadas con Vitest
│   ├── hydraulics.test.ts          # Pruebas del modelo hidráulico y Manning
│   └── regulaFalsi.test.ts         # Pruebas de convergencia y métodos numéricos
├── .gitignore                      # Reglas de exclusión para Git (dist, zip, .env)
├── .oxlintrc.json                  # Configuración del linter Oxlint
├── index.html                      # Plantilla HTML base con fuentes y KaTeX
├── LICENSE                         # Licencia de código abierto MIT
├── netlify.toml                    # Configuración estática residual de Netlify
├── package.json                    # Scripts y manifiesto de dependencias npm
├── package-lock.json               # Árbol exacto de dependencias bloqueadas
├── tsconfig.app.json               # Configuración del compilador TypeScript para src/
├── tsconfig.json                   # Configuración de referencias de TypeScript
├── tsconfig.node.json              # Configuración de TypeScript para herramientas Node
└── vite.config.ts                  # Configuración del empaquetador Vite y Vitest
```

---

## 🌐 Despliegue en Cloudflare Pages

HydroSolve es una Single Page Application (SPA) cliente estática que no requiere servidores backend ni bases de datos activas en tiempo de ejecución.

La aplicación se encuentra desplegada y operativa en producción en **Cloudflare Pages**, con integración continua (CI/CD) vinculada al repositorio de GitHub:

| Parámetro | Configuración de Producción |
| :--- | :--- |
| **Repositorio conectado** | [`Maurxp/HydroSolve`](https://github.com/Maurxp/HydroSolve) |
| **Rama de producción** | `main` |
| **Comando de compilación** | `npm run build` (`tsc -b && vite build`) |
| **Directorio de salida (Publish directory)** | `dist` |
| **Variable de entorno del runner** | `NODE_VERSION = 20` |
| **Dominio de producción activo** | [https://hydrosolve.usco.cloud/](https://hydrosolve.usco.cloud/) |

Cada actualización (*push*) a la rama `main` compila y publica automáticamente la versión más reciente en la red perimetral de Cloudflare Pages.

> **Configuración residual:** El repositorio conserva el archivo `netlify.toml` como soporte alternativo de despliegue estático sin interferir con Cloudflare Pages.

---

## 📚 Documentación Relacionada

Para consultar el marco teórico formal, el desarrollo numérico detallado y las especificaciones técnicas:

* [**Informe Académico**](docs/INFORME_ACADEMICO.md): Memoria técnica formal para la asignatura de Métodos Numéricos. Planteamiento completo del problema, fundamentos hidráulicos de canales abiertos, tabla de 5 iteraciones paso a paso, análisis del fenómeno de estancamiento de extremos e interpretación en ingeniería civil.
* [**Fundamentación Algorítmica**](docs/METODO_NUMERICO.md): Deducción matemática de la recta secante, pseudocódigo estructurado del algoritmo de Regula Falsi, tabla comparativa de tasas de convergencia y consideraciones de estabilidad numérica en punto flotante.
* [**Guía de Despliegue**](docs/DESPLIEGUE.md): Instrucciones técnicas detalladas para la compilación y publicación en plataformas de hosting estático (Cloudflare Pages y Netlify).
* [**Licencia**](LICENSE): Términos legales de distribución bajo licencia de código abierto MIT.

---

## 🧰 Tecnologías Utilizadas

| Categoría | Herramienta | Utilidad en el Proyecto |
| :--- | :--- | :--- |
| **Entorno y Lenguaje** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Construcción de interfaz basada en componentes reactivos con tipado estático estricto. |
| **Empaquetador** | [Vite 8](https://vite.dev/) | Entorno de desarrollo ultrarrápido con HMR y compilación optimizada para producción. |
| **Notación Matemática** | [KaTeX](https://katex.org/) | Renderizado tipográfico rápido y accesible de fórmulas matemáticas LaTeX. |
| **Iconografía e Interacción** | [Lucide React](https://lucide.dev/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) | Iconos vectoriales limpios y animaciones de celebración ante convergencia exitosa. |
| **Pruebas Automatizadas** | [Vitest](https://vitest.dev/) | Suite de pruebas unitarias compatible con la configuración nativa de Vite. |
| **Análisis Estático** | [Oxlint](https://oxc.rs/) | Linter de alto rendimiento basado en Rust para garantizar calidad y consistencia del código. |
| **Estilos** | CSS Moderno Nativo | Sistema de diseño basado en variables CSS (*tokens*), diseño responsivo y modo oscuro. |

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <sub>Desarrollado como proyecto académico para la asignatura de <b>Métodos Numéricos</b> · USCO · 2026</sub>
</div>
