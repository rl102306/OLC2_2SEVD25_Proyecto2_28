import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import os

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
        except LookupError:
            nltk.download(recurso, download_dir=NLTK_DATA_PATH)

descargar_recursos_nltk()

columnas_num = [
    'frecuencia_compra', 'monto_total_gastado', 'monto_promedio_compra',
    'dias_desde_ultima_compra', 'antiguedad_cliente_meses',
    'numero_productos_distintos'
]

def limpiar_texto(texto):
    if pd.isna(texto):
        return ""
    texto = str(texto).lower()
    texto = re.sub(r'[^a-záéíóúñü\s]', ' ', texto)
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto

def preprocesar_texto(df):
    df['texto_reseña_limpio'] = df['texto_reseña'].apply(limpiar_texto)

    stop_words = set(stopwords.words('spanish'))
    df['texto_reseña_sin_stopwords'] = df['texto_reseña_limpio'].apply(
        lambda x: ' '.join([w for w in word_tokenize(x, language='spanish') if w not in stop_words])
    )

    df['longitud_reseña'] = df['texto_reseña_limpio'].apply(lambda x: len(x.split()))
    return df

def manejo_outliers(df, columna):
    Q1 = df[columna].quantile(0.25)
    Q3 = df[columna].quantile(0.75)
    IQR = Q3 - Q1
    li = Q1 - 1.5 * IQR
    ls = Q3 + 1.5 * IQR
    df[columna] = df[columna].clip(lower=li, upper=ls)
    return df

def limpiar_datos(df):
    resumen = {}

    duplicados = df.duplicated(subset=['cliente_id','reseña_id']).sum()
    df = df.drop_duplicates(subset=['cliente_id','reseña_id']).reset_index(drop=True)
    resumen['duplicados_eliminados'] = int(duplicados)

    df['fecha_reseña'] = pd.to_datetime(df['fecha_reseña'], errors='coerce')

    for col in columnas_num:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        valor = df[col].median()
        df[col] = df[col].fillna(valor)

    df['canal_principal'] = df['canal_principal'].fillna('desconocido')
    df['producto_categoria'] = df['producto_categoria'].fillna('sin_categoria')
    df['texto_reseña'] = df['texto_reseña'].fillna('')

    for col in columnas_num:
        df = manejo_outliers(df, col)

    df = preprocesar_texto(df)

    scaler = StandardScaler()
    df[[f'{c}_escalada' for c in columnas_num]] = scaler.fit_transform(df[columnas_num])

    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1,2))
    tfidf = vectorizer.fit_transform(df['texto_reseña_sin_stopwords'])

    tfidf_df = pd.DataFrame(tfidf.toarray(), columns=[f'tfidf_{i}' for i in range(tfidf.shape[1])])
    df = pd.concat([df.reset_index(drop=True), tfidf_df], axis=1)

    resumen['filas_finales'] = int(df.shape[0])
    resumen['columnas_finales'] = int(df.shape[1])
    resumen['features_tfidf'] = int(tfidf.shape[1])

    return df, resumen
