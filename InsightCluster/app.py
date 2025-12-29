from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from flask_cors import CORS
import os
from sklearn.cluster import KMeans
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score
)
from collections import Counter

NLTK_DATA_PATH = os.path.join(os.path.dirname(__file__), 'nltk_data')
os.makedirs(NLTK_DATA_PATH, exist_ok=True)
nltk.data.path.append(NLTK_DATA_PATH)

def descargar_recursos_nltk():
    recursos_necesarios = ['punkt', 'punkt_tab', 'stopwords']
    for recurso in recursos_necesarios:
        try:
            if recurso == 'punkt_tab':
                nltk.data.find('tokenizers/punkt_tab')
            elif recurso == 'punkt':
                nltk.data.find('tokenizers/punkt')
            else:
                nltk.data.find(f'corpora/{recurso}')
            print(f"✓ {recurso} ya está disponible")
        except LookupError:
            print(f"Descargando {recurso}...")
            nltk.download(recurso, download_dir=NLTK_DATA_PATH, quiet=False)

# Ejecutar al iniciar la app
descargar_recursos_nltk()

app = Flask(__name__)
CORS(app)

data_limpio = None
vectorizer = None
datos_limpeza_total = {}


columnas_esperadas = [
    'cliente_id', 'frecuencia_compra', 'monto_total_gastado', 'monto_promedio_compra',
    'dias_desde_ultima_compra', 'antiguedad_cliente_meses', 'canal_principal',
    'numero_productos_distintos', 'fecha_reseña', 'producto_categoria',
    'reseña_id', 'texto_reseña'
]

columnas_num = [
    'frecuencia_compra', 'monto_total_gastado', 'monto_promedio_compra',
    'dias_desde_ultima_compra', 'antiguedad_cliente_meses',
    'numero_productos_distintos'
]

def limpiar_texto(texto):
    if pd.isna(texto):
        return ""
    # Convertir a minúsculas
    texto = str(texto).lower()
    # Eliminar puntuación y números
    texto = re.sub(r'[^a-záéíóúñü\s]', ' ', texto)
    # Eliminar espacios extra
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto

def preprocesar_texto(df):
    df['texto_reseña_limpio'] = df['texto_reseña'].apply(limpiar_texto)

    stop_words = set(stopwords.words('spanish'))
    def remover_stopwords(texto):
        tokens = word_tokenize(texto, language='spanish')
        return ' '.join([word for word in tokens if word not in stop_words])
    
    df['texto_reseña_sin_stopwords'] = df['texto_reseña_limpio'].apply(remover_stopwords)
    
    df['longitud_reseña'] = df['texto_reseña_limpio'].apply(lambda x: len(x.split()))
    
    return df

def manejo_outliers(df, columna, metodo='clip'):
    Q1 = df[columna].quantile(0.25)
    Q3 = df[columna].quantile(0.75)
    IQR = Q3 - Q1
    limite_inferior = Q1 - 1.5 * IQR
    limite_superior = Q3 + 1.5 * IQR
    
    antes = df[columna].describe()
    
    if metodo == 'clip':
        df[columna] = df[columna].clip(lower=limite_inferior, upper=limite_superior)
    elif metodo == 'remove':
        df = df[(df[columna] >= limite_inferior) & (df[columna] <= limite_superior)]
    
    despues = df[columna].describe()
    
    return df, {
        'antes': antes.to_dict(),
        'despues': despues.to_dict(),
        'outliers_detectados': int((antes['count'] - despues['count']) if metodo == 'remove' else 0)
    }

def limpiar_datos(df):
    resumen = {
        'duplicados_eliminados': 0,
        'nulos_manejados': {},
        'outliers_tratados': {},
        'filas_iniciales': df.shape[0],
        'columnas_iniciales': df.shape[1]
    }
    
    # Eliminar duplicados basado en id del cliente y id de la reseña
    duplicados = df.duplicated(subset=['cliente_id', 'reseña_id']).sum()
    df = df.drop_duplicates(subset=['cliente_id', 'reseña_id']).reset_index(drop=True)
    resumen['duplicados_eliminados'] = int(duplicados)
    
    # Convertir fechas y tipos para ids
    df['cliente_id'] = df['cliente_id'].astype(int)
    df['reseña_id'] = df['reseña_id'].astype(int)
    df['fecha_reseña'] = pd.to_datetime(df['fecha_reseña'], errors='coerce')
    
    for col in columnas_num:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Manejo de valores nulos
    nulos_manejados = {}
    for col in df.columns:
        nulos_antes = df[col].isnull().sum()
        if nulos_antes > 0:
            if col in columnas_num:
                valor = df[col].median()
                df[col] = df[col].fillna(valor)
            elif col == 'canal_principal':
                df[col].fillna('desconocido', inplace=True)
            elif col == 'producto_categoria':
                df[col].fillna('sin_categoria', inplace=True)
            elif col == 'texto_reseña':
                df[col].fillna('', inplace=True)
            
            nulos_despues = df[col].isnull().sum()
            nulos_manejados[col] = int(nulos_antes - nulos_despues)
    
    resumen['nulos_manejados'] = nulos_manejados
    
    # tratamiento de outliers para columnas numéricas clave
    outliers_info = {}
    for col in ['monto_total_gastado', 'monto_promedio_compra', 'frecuencia_compra', 'dias_desde_ultima_compra']:
        if col in df.columns:
            df, info = manejo_outliers(df, col, metodo='clip')
            outliers_info[col] = info
    
    resumen['outliers_tratados'] = outliers_info
    
    df = preprocesar_texto(df)
    
    scaler = StandardScaler()
    df[[f'{col}_escalada' for col in columnas_num]] = scaler.fit_transform(
        df[columnas_num]
    )

    global vectorizer
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1,2))
    tfidf_matrix = vectorizer.fit_transform(df['texto_reseña_sin_stopwords'])
    tfidf_df = pd.DataFrame(
        tfidf_matrix.toarray(),
        columns=[f'tfidf_{i}' for i in range(tfidf_matrix.shape[1])]
    )
    df = pd.concat([df.reset_index(drop=True), tfidf_df], axis=1)
    
    resumen['filas_finales'] = df.shape[0]
    resumen['columnas_finales'] = df.shape[1]
    resumen['features_tfidf_generadas'] = tfidf_matrix.shape[1]
    
    return df, resumen




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




@app.route("/carga-masiva", methods=["POST"])
def carga_masiva():
    global data_limpio, datos_limpeza_total
    
    if "file" not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400
    
    file = request.files["file"]
    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Solo se permiten archivos CSV"}), 400
    
    try:
        df = pd.read_csv(file)
        
        # Validar columnas requeridas
        columnas_faltantes = [col for col in columnas_esperadas if col not in df.columns]
        if columnas_faltantes:
            return jsonify({
                "error": "Faltan columnas requeridas",
                "columnas_faltantes": columnas_faltantes,
                "columnas_recibidas": list(df.columns)
            }), 400

        data_limpio, resumen = limpiar_datos(df)
        datos_limpeza_total = resumen
        
        return jsonify({
            "mensaje": "Carga masiva y limpieza completada exitosamente",
            "resumen_limpieza": resumen,
            "vista_previa": data_limpio.head(3).to_dict(orient="records"),
            "columnas_finales": list(data_limpio.columns)
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": "Error durante el procesamiento",
            "detalle": str(e)
        }), 500



if __name__ == "__main__":
    app.run(debug=True)