import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score
)
from collections import Counter

COLUMNAS_MODELO = [
    'frecuencia_compra_escalada',
    'monto_total_gastado_escalada',
    'monto_promedio_compra_escalada',
    'dias_desde_ultima_compra_escalada',
    'antiguedad_cliente_meses_escalada',
    'numero_productos_distintos_escalada'
]

COLUMNAS_ANALISIS_ORIGINALES = [
    'frecuencia_compra',
    'monto_total_gastado',
    'monto_promedio_compra',
    'dias_desde_ultima_compra',
    'antiguedad_cliente_meses',
    'numero_productos_distintos'
]

def metodo_codo(x_scaled, random_state=42, n_init=10, k_max=10):
    inercia = []
    k_rango = list(range(1, k_max + 1))
    for k in k_rango:
        kmeans = KMeans(n_clusters=k, random_state=random_state, n_init=n_init)
        kmeans.fit(x_scaled)
        inercia.append(float(kmeans.inertia_))
    return {"k": k_rango, "inercia": inercia}

def metodo_silueta(x_scaled, random_state=42, n_init=10, k_min=2, k_max=10):
    silueta = []
    k_rango = list(range(k_min, k_max + 1))
    for k in k_rango:
        kmeans = KMeans(n_clusters=k, random_state=random_state, n_init=n_init)
        labels = kmeans.fit_predict(x_scaled)
        score = silhouette_score(x_scaled, labels)
        silueta.append(float(score))
    return {"k": k_rango, "silueta": silueta}

def entrenar_kmeans(df: pd.DataFrame, parametros: dict):
    if df.empty:
        raise ValueError("El DataFrame está vacío. Debes cargar y limpiar datos primero.")

    missing_cols = [col for col in COLUMNAS_MODELO if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Faltan columnas escaladas necesarias: {missing_cols}")

    x_scaled = df[COLUMNAS_MODELO]
    n_clusters = int(parametros.get("n_clusters", 4))
    random_state = int(parametros.get("random_state", 42))
    n_init = int(parametros.get("n_init", 10))
    k_max = int(parametros.get("k_max", 10))

    resultado_codo = metodo_codo(x_scaled, random_state, n_init, k_max)
    resultado_silueta = metodo_silueta(x_scaled, random_state, n_init, 2, k_max)

    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=random_state,
        n_init=n_init
    )
    df = df.copy() 
    df["cluster"] = kmeans.fit_predict(x_scaled)
    sil_final = silhouette_score(x_scaled, df["cluster"])
    calinski = calinski_harabasz_score(x_scaled, df["cluster"])
    davies = davies_bouldin_score(x_scaled, df["cluster"])

    perfilado = (
        df.groupby("cluster")[COLUMNAS_ANALISIS_ORIGINALES]
        .mean()
        .round(2)
        .reset_index()
    )

    analisis_reseñas = {}
    for c in sorted(df["cluster"].unique()):
        textos = df[df["cluster"] == c]["texto_reseña_sin_stopwords"]
        palabras = " ".join(textos.dropna()).split()
        analisis_reseñas[int(c)] = {
            "cantidad_reseñas": int(len(textos)),
            "palabras_frecuentes": Counter(palabras).most_common(10)
        }

    descripciones = {}
    for _, fila in perfilado.iterrows():
        c = int(fila["cluster"])
        descripciones[c] = (
            f"Segmento {c}: clientes con frecuencia promedio de {fila['frecuencia_compra']:.1f} compras, "
            f"gasto total promedio de ${fila['monto_total_gastado']:.0f}, "
            f"y recencia de {fila['dias_desde_ultima_compra']:.0f} días."
        )

    return {
        "parametros_usados": {
            "n_clusters": n_clusters,
            "random_state": random_state,
            "n_init": n_init,
            "k_max_evaluado": k_max
        },
        "metodo_codo": resultado_codo,
        "metodo_silueta": resultado_silueta,
        "metricas_finales": {
            "silhouette_score": round(float(sil_final), 4),
            "calinski_harabasz": round(float(calinski), 2),
            "davies_bouldin": round(float(davies), 4)
        },
        "perfilado_numerico": perfilado.to_dict(orient="records"),
        "analisis_reseñas_por_cluster": analisis_reseñas,
        "descripcion_segmentos": descripciones,
        "total_clientes": int(df["cliente_id"].nunique()),
        "distribucion_clusters": df["cluster"].value_counts().sort_index().to_dict()
    }