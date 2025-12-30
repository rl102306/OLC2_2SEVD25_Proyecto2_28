import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from procesamiento.normalizacion_texto import preprocesar_texto

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

vectorizer = None

def manejo_outliers(df: pd.DataFrame, columna: str, metodo: str = 'clip'):
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

def limpiar_datos(df: pd.DataFrame):
    global vectorizer

    resumen = {
        'duplicados_eliminados': 0,
        'nulos_manejados': {},
        'outliers_tratados': {},
        'filas_iniciales': df.shape[0],
        'columnas_iniciales': df.shape[1]
    }

    # Duplicados
    duplicados = df.duplicated(subset=['cliente_id', 'reseña_id']).sum()
    df = df.drop_duplicates(subset=['cliente_id', 'reseña_id']).reset_index(drop=True)
    resumen['duplicados_eliminados'] = int(duplicados)

    # Tipos de datos
    df['cliente_id'] = df['cliente_id'].astype(int)
    df['reseña_id'] = df['reseña_id'].astype(int)
    df['fecha_reseña'] = pd.to_datetime(df['fecha_reseña'], errors='coerce')
    for col in columnas_num:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Nulos
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

    # Outliers
    outliers_info = {}
    for col in ['monto_total_gastado', 'monto_promedio_compra', 'frecuencia_compra', 'dias_desde_ultima_compra']:
        if col in df.columns:
            df, info = manejo_outliers(df, col, metodo='clip')
            outliers_info[col] = info
    resumen['outliers_tratados'] = outliers_info

    # llamar a preprocesar_texto
    df = preprocesar_texto(df)


    scaler = StandardScaler()
    df[[f'{col}_escalada' for col in columnas_num]] = scaler.fit_transform(df[columnas_num])

    # TF-IDF
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(df['texto_reseña_sin_stopwords'])
    tfidf_df = pd.DataFrame(
        tfidf_matrix.toarray(),
        columns=[f'tfidf_{i}' for i in range(tfidf_matrix.shape[1])]
    )
    df = pd.concat([df.reset_index(drop=True), tfidf_df], axis=1)

    resumen['filas_finales'] = df.shape[0]
    resumen['columnas_finales'] = df.shape[1]
    resumen['features_tfidf_generadas'] = tfidf_matrix.shape[1]

    return df, resumen, vectorizer