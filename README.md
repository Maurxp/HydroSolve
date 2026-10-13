# HydroSolve

Aplicación web interactiva para el cálculo del tirante normal en canales trapezoidales mediante el método de falsa posición (Regula Falsi) y la ecuación de Manning. Desarrollada como proyecto para la asignatura de Métodos Numéricos en Ingeniería Civil.

---

## Descripción del problema

En hidráulica de canales abiertos, el **tirante normal** ($y_n$) es la profundidad que alcanza el agua cuando el flujo es uniforme y permanente. Bajo estas condiciones, la fuerza de gravedad que impulsa el agua se equilibra con la fricción del fondo y las paredes del canal.

El caudal se calcula mediante la ecuación de Manning:

$$Q = \frac{1}{n} A R^{2/3} \sqrt{S}$$

Para una sección trapezoidal con ancho de fondo $b$ y talud lateral $z$, el área hidráulica $A(y) = y(b + zy)$ y el radio hidráulico $R(y) = A(y) / P(y)$ dependen del tirante con exponentes fraccionarios. Esto genera una ecuación no lineal donde la incógnita $y$ no puede despejarse directamente:

$$f(y) = \frac{1}{n} A(y) R(y)^{2/3} \sqrt{S} - Q = 0$$

HydroSolve implementa el método de falsa posición para aproximar numéricamente la raíz positiva de $f(y) = 0$, permitiendo observar cómo evoluciona la aproximación, la reducción del error y la geometría del canal en cada iteración.

---

## Funcionalidades principales

* **Cálculo con falsa posición:** Resuelve la ecuación de Manning a partir de los datos geométricos e hidráulicos ingresados por el usuario.
* **Simulador paso a paso:** Permite avanzar, retroceder, reproducir o saltar al final del cálculo para analizar cada iteración individualmente.
* **Visualización geométrica del canal:** Esquema dinámico en SVG que actualiza las proporciones de la sección trapezoidal y el nivel de agua en cada paso.
* **Gráfica de la función hidráulica:** Representación de $f(y)$ junto con la recta secante entre los extremos $[a, b]$, mostrando visualmente el punto de corte $x_r$.
* **Curva de convergencia:** Gráfica del error relativo aproximado ($\varepsilon_a$) frente a la tolerancia establecida ($\varepsilon_s$).
* **Tabla numérica completa:** Historial de todas las iteraciones con sus extremos, aproximaciones, residuos y errores, con opción de copiar y exportar a CSV.
* **Desarrollo matemático guiado:** Explicación en 15 pasos con las fórmulas evaluadas numéricamente con los parámetros activos.
* **Comparación de métodos:** Ejecución paralela con los métodos de bisección y Newton-Raphson para comparar número de iteraciones y comportamiento numérico.

---

## Tecnologías utilizadas

* **Frontend:** React 19 con TypeScript.
* **Empaquetador y entorno local:** Vite 8.
* **Notación matemática:** KaTeX.
* **Iconos:** Lucide React.
* **Pruebas unitarias:** Vitest.

---

## Ejecución local

### Requisitos previos
* Node.js (versión 18 o superior recomendada).
* npm (incluido con Node.js).

### Instalación
Clonar el repositorio o descargar el código fuente y situarse en la carpeta del proyecto:

```bash
npm install
```

### Comandos disponibles

```bash
# Iniciar el servidor de desarrollo local
npm run dev

# Ejecutar las pruebas unitarias
npm run test

# Verificar tipos y compilar para producción
npm run build

# Previsualizar localmente la versión de producción compilada
npm run preview

# Ejecutar el linter
npm run lint
```

---

## Estructura del proyecto

```text
HydroSolve/
├── docs/                     # Documentación académica y guía de despliegue
│   ├── INFORME_ACADEMICO.md  # Informe formal del problema, desarrollo y resultados
│   ├── METODO_NUMERICO.md    # Deducción del método, pseudocódigo y notas algorítmicas
│   └── DESPLIEGUE.md         # Instrucciones de despliegue para hosting estático
├── src/
│   ├── components/           # Componentes de interfaz (canal SVG, gráficas, tablas)
│   ├── hydraulics/           # Ecuaciones hidráulicas de Manning y validaciones
│   ├── math/                 # Implementación de falsa posición, bisección y Newton
│   ├── styles/               # Estilos CSS y variables de diseño
│   ├── types/                # Definiciones de tipos TypeScript
│   └── utils/                # Formateo numérico y exportación a CSV
├── tests/                    # Pruebas unitarias con Vitest
├── index.html                # Plantilla base de la aplicación
├── package.json              # Dependencias y scripts del proyecto
└── vite.config.ts            # Configuración de Vite y entorno de pruebas
```

---

## Documentación adicional

Para profundizar en el marco teórico y la evaluación hidráulica del problema:

* [Informe Académico](docs/INFORME_ACADEMICO.md): Planteamiento completo, objetivos, marco teórico, desarrollo iterativo detallado, análisis de resultados y referencias bibliográficas.
* [Método Numérico](docs/METODO_NUMERICO.md): Deducción analítica de la fórmula de interpolación secante, pseudocódigo y consideraciones de estabilidad numérica.
* [Guía de Despliegue](docs/DESPLIEGUE.md): Procedimiento para publicar la aplicación en plataformas de hosting estático como Netlify.

---

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
