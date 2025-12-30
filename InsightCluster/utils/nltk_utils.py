import os
import nltk
from nltk.corpus import stopwords

NLTK_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'nltk_data')
os.makedirs(NLTK_DATA_PATH, exist_ok=True)
nltk.data.path.append(NLTK_DATA_PATH)

def descargar_recursos_nltk():
    recursos_necesarios = ['punkt', 'punkt_tab', 'stopwords']
    for recurso in recursos_necesarios:
        try:
            if recurso in ['punkt', 'punkt_tab']:
                nltk.data.find(f'tokenizers/{recurso}')
            else:
                nltk.data.find(f'corpora/{recurso}')
        except LookupError:
            print(f"Descargando {recurso}...")
            nltk.download(recurso, download_dir=NLTK_DATA_PATH, quiet=False)

def obtener_stopwords_espanol():
    return set(stopwords.words('spanish'))