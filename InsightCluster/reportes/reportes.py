# reportes/reportes.py

def _validar_resultado(resultado_entrenamiento):
    if resultado_entrenamiento is None:
        raise ValueError("No existe un modelo entrenado. Ejecuta primero /entrenar.")


# ---------------------------------------------------
# 1. EFICIENCIA DEL MODELO (FINAL)
# ---------------------------------------------------
def reporte_eficiencia_modelo(resultado_entrenamiento):
    _validar_resultado(resultado_entrenamiento)

    metricas = resultado_entrenamiento.get("metricas_finales", {})

    silhouette = metricas.get("silhouette_score", 0)
    davies = metricas.get("davies_bouldin", 0)

    interpretacion = {
        "silhouette": (
            "Separación aceptable entre clusters."
            if silhouette >= 0.4 else
            "Separación débil entre clusters."
        ),
        "davies_bouldin": (
            "Clusters bien diferenciados."
            if davies <= 1 else
            "Alta similitud entre clusters."
        )
    }

    return {
        "metricas": metricas,
        "interpretacion": interpretacion
    }


# ---------------------------------------------------
# 2. DISTRIBUCIÓN DE CLUSTERS
# ---------------------------------------------------
def reporte_distribucion_clusters(resultado_entrenamiento):
    _validar_resultado(resultado_entrenamiento)

    total = resultado_entrenamiento.get("total_clientes", 0)
    distribucion = resultado_entrenamiento.get("distribucion_clusters", {})

    clusters = []
    for cluster, cantidad in distribucion.items():
        porcentaje = (cantidad / total * 100) if total > 0 else 0
        clusters.append({
            "cluster": int(cluster),
            "cantidad": int(cantidad),
            "porcentaje": round(porcentaje, 2)
        })

    clusters.sort(key=lambda x: x["cluster"])

    return {
        "total_clientes": total,
        "clusters": clusters
    }


# ---------------------------------------------------
# 3. PERFIL NUMÉRICO POR CLUSTER
# ---------------------------------------------------
def reporte_perfil_numerico(resultado_entrenamiento):
    _validar_resultado(resultado_entrenamiento)

    return {
        "clusters": resultado_entrenamiento.get("perfilado_numerico", [])
    }


# ---------------------------------------------------
# 4. ANÁLISIS DE RESEÑAS POR CLUSTER
# ---------------------------------------------------
def reporte_analisis_reseñas(resultado_entrenamiento):
    _validar_resultado(resultado_entrenamiento)

    analisis = resultado_entrenamiento.get("analisis_reseñas_por_cluster", {})
    salida = []

    for cluster, info in analisis.items():
        salida.append({
            "cluster": int(cluster),
            "cantidad_reseñas": int(info.get("cantidad_reseñas", 0)),
            "palabras_frecuentes": info.get("palabras_frecuentes", [])
        })

    salida.sort(key=lambda x: x["cluster"])

    return {
        "clusters": salida
    }


# ---------------------------------------------------
# 5. DESCRIPCIÓN DE SEGMENTOS
# ---------------------------------------------------
def reporte_descripciones_clusters(resultado_entrenamiento):
    _validar_resultado(resultado_entrenamiento)

    descripciones = resultado_entrenamiento.get("descripcion_segmentos", {})

    return {
        "clusters": [
            {
                "cluster": int(cluster),
                "descripcion": descripcion
            }
            for cluster, descripcion in descripciones.items()
        ]
    }
