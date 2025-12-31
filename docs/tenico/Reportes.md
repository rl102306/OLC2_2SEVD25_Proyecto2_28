El módulo de reportes de **InsightCluster** fue diseñado con el objetivo de traducir los resultados técnicos del modelo de aprendizaje no supervisado en información clara y comprensible para cualquier usuario.

Dado que el problema abordado no cuenta con etiquetas previas, los reportes implementados permiten:
- Evaluar la calidad del modelo mediante métricas internas.
- Comprender la estructura y distribución de los clusters generados.
- Analizar los segmentos desde una perspectiva numérica y textual.
- Generar descripciones finales útiles para la toma de decisiones.

Cada reporte cumple una función específica dentro del flujo de análisis y evita depender de un único indicador.

---

## 1. Reporte de eficiencia del modelo  
**Endpoint:** `/reportes/eficiencia-modelo`

En modelos no supervisados no es posible medir la precisión de forma tradicional. Por ello, este reporte permite evaluar la calidad del clustering mediante métricas internas de cohesión y separación, garantizando la confiabilidad del análisis realizado.

### Datos
- **Silhouette Score**: mide qué tan bien separados están los clusters.
- **Davies-Bouldin Index**: evalúa la similitud entre clusters (valores menores indican mejor separación).
- Interpretación automática basada en umbrales definidos.

### Objetivo
- Convierte métricas numéricas en interpretaciones comprensibles.
- Permite a usuarios no técnicos evaluar si el modelo es adecuado.
- Refuerza la interpretación crítica de los resultados.
---

## 2. Reporte de distribución de clusters  
**Endpoint:** `/reportes/distribucion-clusters`


La simple generación de clusters no es suficiente; es necesario conocer el peso relativo de cada segmento dentro del conjunto de datos para comprender su relevancia.

### Datos
- Cantidad de elementos por cluster.
- Porcentaje que representa cada cluster respecto al total.
- Identificación de clusters dominantes o minoritarios.

### Objetivo
- Facilita una comprensión inmediata del impacto de cada segmento.
- Es fácilmente representable en tablas y gráficos.
- Evita interpretaciones erróneas sobre la importancia de los clusters.
---

## 3. Reporte de perfil numérico por cluster  
**Endpoint:** `/reportes/perfil-numerico`


Este reporte permite caracterizar cuantitativamente los segmentos descubiertos, utilizando las variables numéricas disponibles en el conjunto de datos.

### Datos
- Promedios y estadísticas por cluster.
- Identificación de patrones de consumo, frecuencia y comportamiento.
- Comparación objetiva entre segmentos.

### Objetivo
- Presenta información estructurada y clara por cluster.
- Facilita la construcción de descripciones interpretables.
- Sirve como base para el análisis final de segmentos.
---

## 4. Reporte de análisis de reseñas por cluster  
**Endpoint:** `/reportes/analisis-reseñas`


Dado que el proyecto integra datos textuales, este reporte permite analizar el contenido semántico de las reseñas asociadas a cada cluster, complementando el análisis numérico.

### Datos
- Cantidad de reseñas por cluster.
- Palabras más frecuentes por segmento.
- Identificación de temas predominantes sin uso de modelos preentrenados.

### Objetivo
- Convierte texto no estructurado en información interpretable.
- Permite comprender qué opinan los clientes dentro de cada segmento.
- Enriquece el perfilado de los clusters desde una perspectiva cualitativa.
---

## 5. Reporte de descripción de segmentos  
**Endpoint:** `/reportes/descripciones`


Este reporte sintetiza toda la información generada previamente y representa el resultado final del proceso de clustering, transformando datos técnicos en conocimiento útil.

### Datos
- Integración de variables numéricas y análisis textual.
- Resumen interpretativo de cada cluster.

### Objetivo
- Está orientado a usuarios no técnicos.
- Permite comprender cada segmento sin conocimientos de machine learning.
- Facilita la toma de decisiones basada en los resultados del análisis.