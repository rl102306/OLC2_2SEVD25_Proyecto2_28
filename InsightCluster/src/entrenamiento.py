import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score
)
from collections import Counter


# ===============================
# MÉTODO DEL CODO (INERCIA)
# ===============================

def metodo_codo(x_scaled, random_state=42, n_init=10, k_max=10):
    inercia = []
    k_rango = list(range(1, k_max + 1))

    for k in k_rango:
        kmeans = KMeans(
            n_clusters=k,
            random_state=random_state,
            n_init=n_init
        )
        kmeans.fit(x_scaled)
        inercia.append(float(kmeans.inertia_))

    return {"k": k_rango, "inercia": inercia}


# ===============================
# MÉTODO DE SILUETA
# ===============================

def metodo_silueta(x_scaled, random_state=42, n_init=10, k_min=2, k_max=10):
    silueta = []
    k_rango = list(range(k_min, k_max + 1))

    for k in k_rango:
        kmeans = KMeans(
            n_clusters=k,
            random_state=random_state,
            n_init=n_init
        )
        labels = kmeans.fit_predict(x_scaled)
        silueta.append(float(silhouette_score(x_scaled, labels)))

    return {"k": k_rango, "silueta": silueta}


# ===============================
# ENTRENAMIENTO K-MEANS
# ===============================

def entrenar_kmeans(df, parametros):

    columnas_modelo = [
        'frecuencia_compra_escalada',
        'monto_total_gastado_escalada',
        'monto_promedio_compra_escalada',
        'dias_desde_ultima_compra_escalada',
        'antiguedad_cliente_meses_escalada',
        'numero_productos_distintos_escalada'
    ]

    x_scaled = df[columnas_modelo]

    # Parámetros desde frontend
    n_clusters = int(parametros.get("n_clusters", 4))
    random_state = int(parametros.get("random_state", 42))
    n_init = int(parametros.get("n_init", 10))
    k_max = int(parametros.get("k_max", 10))

    # Evaluaciones
    resultado_codo = metodo_codo(x_scaled, random_state, n_init, k_max)
    resultado_silueta = metodo_silueta(x_scaled, random_state, n_init, 2, k_max)

    # Entrenamiento final
    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=random_state,
        n_init=n_init
    )

    df["cluster"] = kmeans.fit_predict(x_scaled)

    # Métricas finales
    #sil_final = silhouette_score(x_scaled, df["cluster"])
    calinski = calinski_harabasz_score(x_scaled, df["cluster"])
    davies = davies_bouldin_score(x_scaled, df["cluster"])

    # Perfilado numérico
    columnas_analisis = [
        'frecuencia_compra',
        'monto_total_gastado',
        'monto_promedio_compra',
        'dias_desde_ultima_compra',
        'antiguedad_cliente_meses',
        'numero_productos_distintos'
    ]

    perfilado = df.groupby("cluster")[columnas_analisis].mean().reset_index()

    # Análisis de reseñas
    analisis_reseñas = {}
    for c in df["cluster"].unique():
        textos = df[df["cluster"] == c]["texto_reseña_sin_stopwords"]
        palabras = " ".join(textos).split()
        analisis_reseñas[int(c)] = {
            "cantidad_reseñas": int(len(textos)),
            "palabras_frecuentes": Counter(palabras).most_common(10)
        }

    # Descripción de segmentos
    descripciones = {}
    for _, fila in perfilado.iterrows():
        c = int(fila["cluster"])
        descripciones[c] = (
            f"Segmento {c}: frecuencia {fila['frecuencia_compra']:.2f}, "
            f"gasto total {fila['monto_total_gastado']:.2f}, "
            f"monto promedio {fila['monto_promedio_compra']:.2f}"
        )

    return {
        "parametros": parametros,
        "metodo_codo": resultado_codo,
        "metodo_silueta": resultado_silueta,
        "metricas_finales": {
            "calinski_harabasz": round(float(calinski), 2),
            "davies_bouldin": round(float(davies), 4)
        },
        "perfilado_numerico": perfilado.to_dict(orient="records"),
        "analisis_reseñas": analisis_reseñas,
        "descripcion_segmentos": descripciones
    }
