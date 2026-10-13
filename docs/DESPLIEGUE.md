# Guía de Despliegue

HydroSolve es una aplicación de una sola página (SPA) cliente construida con Vite, React y TypeScript. Al no requerir backend ni base de datos, se compila como un conjunto de archivos estáticos HTML, CSS y JavaScript que pueden alojarse en cualquier servicio de hosting estático.

---

## 1. Parámetros de compilación

* **Entorno de ejecución:** Node.js 18 o superior.
* **Comando de instalación:** `npm install` (o `npm ci`).
* **Comando de compilación:** `npm run build`.
* **Directorio de salida:** `dist`.
* **Variables de entorno:** Ninguna requerida.

---

## 2. Despliegue en Netlify

El repositorio incluye el archivo de configuración `netlify.toml` en la raíz con las reglas de compilación y redirección necesarias:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Pasos:
1. Conectar el repositorio de GitHub en [Netlify](https://app.netlify.com/).
2. Netlify detectará automáticamente los parámetros del archivo `netlify.toml`:
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`
3. Presionar **Deploy site**.
4. Cada actualización en la rama principal (`main`) generará una nueva compilación automáticamente.

---

## 3. Despliegue en otras plataformas estáticas

Si se prefiere utilizar otro proveedor de hosting estático (como Vercel o Cloudflare Pages), la configuración es equivalente:

| Parámetro | Valor |
| :--- | :--- |
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Node.js version** | 18.x o superior |

Para **Cloudflare Pages** (orientado al dominio `hydrosolve.usco.cloud`):
* Conectar el repositorio de GitHub y seleccionar la rama de producción `main`.
* Configurar `npm run build` como comando de compilación y `dist` como directorio de salida.
* En variables de entorno de compilación de Cloudflare, definir `NODE_VERSION = 20` para compatibilidad con las herramientas del proyecto.

---

## 4. Verificación del despliegue

Una vez completada la publicación:
1. Abrir la URL generada en el navegador.
2. Comprobar que las fuentes tipográficas y los símbolos matemáticos de KaTeX se muestren correctamente sin errores en la consola.
3. Verificar el cálculo con los parámetros por defecto ($Q = 12\text{ m}^3/\text{s}$, $b = 3\text{ m}$, $z = 1,5$, $S = 0,001$, $n = 0,025$) para corroborar que el tirante normal obtenido sea $y_n \approx 1,686\text{ m}$.
4. Probar la descarga del archivo CSV desde la tabla de iteraciones.
