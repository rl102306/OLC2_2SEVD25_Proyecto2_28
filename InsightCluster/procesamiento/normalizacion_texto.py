import re
import pandas as pd
import nltk
from utils.nltk_utils import obtener_stopwords_espanol

def limpiar_texto_basico(texto: str) -> str:
    if pd.isna(texto):
        return ""
    texto = str(texto).lower()
    texto = re.sub(r'[^a-záéíóúñü\s]', ' ', texto)
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto

def remover_stopwords_y_tokenizar(texto: str) -> str:
    tokens = nltk.word_tokenize(texto, language='spanish')
    stop_words = obtener_stopwords_espanol()
    return ' '.join([word for word in tokens if word not in stop_words])

def preprocesar_texto(df: pd.DataFrame) -> pd.DataFrame:
    df['texto_reseña_limpio'] = df['texto_reseña'].apply(limpiar_texto_basico)
    df['texto_reseña_sin_stopwords'] = df['texto_reseña_limpio'].apply(remover_stopwords_y_tokenizar)
    df['longitud_reseña'] = df['texto_reseña_limpio'].apply(lambda x: len(x.split()))
    return df