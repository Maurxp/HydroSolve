# Fundamentación Algorítmica: Método de Falsa Posición

Este documento resume la deducción matemática de la fórmula de interpolación secante, el pseudocódigo formal y las consideraciones de estabilidad numérica implementadas en HydroSolve. Para el desarrollo del caso de estudio de hidráulica, consulta el [Informe Académico](INFORME_ACADEMICO.md).

---

## 1. Deducción de la fórmula de falsa posición

Sean $(a, f(a))$ y $(b, f(b))$ dos puntos sobre la curva $y = f(x)$, con $f(a) \cdot f(b) < 0$.

La pendiente de la recta secante que une ambos puntos es:

$$m = \frac{f(b) - f(a)}{b - a}$$

La ecuación punto-pendiente de la secante es:

$$y - f(b) = \frac{f(b) - f(a)}{b - a}(x - b)$$

Para encontrar la intersección de la recta con el eje horizontal ($y = 0$), se define $x = x_r$:

$$-f(b) = \frac{f(b) - f(a)}{b - a}(x_r - b)$$

Multiplicando por $(b - a)$ y agrupando:

$$f(b)(a - b) = [f(b) - f(a)](x_r - b)$$

Dividiendo entre $[f(a) - f(b)]$ con cambio de signo:

$$x_r = b - \frac{f(b)(a - b)}{f(a) - f(b)}$$

Desarrollando los términos en el numerador se obtiene la forma equivalente:

$$x_r = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)}$$

---

## 2. Pseudocódigo del algoritmo

```text
ALGORITMO RegulaFalsi(f, a, b, tol, maxIter):
    // 1. Verificación de cambio de signo inicial (Teorema de Bolzano)
    fa = f(a)
    fb = f(b)
    
    Si fa * fb > 0:
        Retornar ERROR("No existe cambio de signo en el intervalo inicial")
    
    Si |fa| < 1e-12: Retornar (a, EXACTA)
    Si |fb| < 1e-12: Retornar (b, EXACTA)

    prevXr = NULO
    
    Para i = 1 hasta maxIter hacer:
        denom = fa - fb
        Si |denom| < 1e-18:
            Retornar ERROR("Denominador cercano a cero: posible inestabilidad")
            
        // Interpolación secante
        xr = b - (fb * (a - b)) / denom
        fxr = f(xr)
        
        // Cálculo del error relativo aproximado
        Si i == 1:
            ea = N/A   // No existe estimación previa en la primera iteración
        Sino:
            ea = |(xr - prevXr) / xr| * 100%
            
        // Comprobación del criterio de parada
        Si |fxr| < 1e-12 o (ea no es NULO y ea <= tol):
            Retornar (xr, CONVERGIDO, i)
            
        // Actualización del intervalo
        Si fb * fxr < 0:
            a = xr
            fa = fxr
        Sino:
            b = xr
            fb = fxr
            
        prevXr = xr
        
    Retornar (xr, MAX_ITER_ALCANZADO, maxIter)
```

---

## 3. Comparativa de velocidad de convergencia

| Criterio | Bisección | Falsa Posición | Newton-Raphson |
| :--- | :---: | :---: | :---: |
| **Tipo de método** | Cerrado | Cerrado | Abierto |
| **Orden de convergencia** | 1 (Lineal, factor 0.5) | Generalmente superlineal | 2 (Cuadrático) |
| **Evaluaciones por paso** | 1 evaluación ($f$) | 1 evaluación ($f$) | 2 evaluaciones ($f$ y $f'$) |
| **Requiere derivada** | No | No | Sí ($f'(x)$) |
| **Garantía de convergencia** | Incondicional si hay cambio de signo | Incondicional si hay cambio de signo | Condicional (puede divergir) |
| **Sensibilidad a concavidad** | Insensible | Susceptible a estancamiento de un extremo | Sensible a puntos de inflexión |
| **Iteraciones caso base ($Q=12$)** | 14 pasos | 5 pasos | 3 a 4 pasos |

---

## 4. Consideraciones de implementación

1. **Error en la primera iteración:** El error relativo aproximado $\varepsilon_a$ requiere dos aproximaciones consecutivas ($x_{r,i}$ y $x_{r,i-1}$). En la iteración 1 se reporta como `null` / `N/A`, evitando mostrar $0\%$, lo que induciría a una interpretación errónea de convergencia inmediata.
2. **Prevención de división por cero:** Se comprueba que $|f(a) - f(b)| > 10^{-18}$ antes de ejecutar la división secante.
3. **El problema del extremo estancado:** Si $f(x)$ mantiene una concavidad constante en el intervalo ($f''(x) > 0$ o $f''(x) < 0$), las aproximaciones secantes se acercan a la raíz siempre desde el mismo lado, dejando el otro extremo fijo. Modificaciones como el método de Illinois o Anderson-Björck atenúan este efecto dividiendo por 2 el valor de la función en el extremo estancado cuando este se repite.
