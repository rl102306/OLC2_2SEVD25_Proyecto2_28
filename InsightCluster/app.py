from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os

from utils.nltk_utils import descargar_recursos_nltk
from procesamiento.limpieza_datos import limpiar_datos, columnas_esperadas
from entrenamiento.entrenamiento import entrenar_kmeans
from reportes.reportes import (
    reporte_eficiencia_modelo,
    reporte_distribucion_clusters,
    reporte_perfil_numerico,
    reporte_analisis_reseñas,
    reporte_descripciones_clusters
)

descargar_recursos_nltk()


app = Flask(__name__)
CORS(app)

data_limpio = None
datos_limpeza_total = {}
resultado_entrenamiento = None

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

        # Validar columnas
        columnas_faltantes = [col for col in columnas_esperadas if col not in df.columns]
        if columnas_faltantes:
            return jsonify({
                "error": "Faltan columnas requeridas",
                "columnas_faltantes": columnas_faltantes,
                "columnas_recibidas": list(df.columns)
            }), 400

        data_limpio, resumen, _ = limpiar_datos(df)
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

@app.route("/entrenar", methods=["POST"])
def entrenar():
    global data_limpio, resultado_entrenamiento

    if data_limpio is None:
        return jsonify({"error": "No hay datos cargados. Primero realiza la carga masiva."}), 400
    parametros = request.get_json() or {}

    try:
        resultado_entrenamiento = entrenar_kmeans(data_limpio, parametros)

        return jsonify({
            "mensaje": "Entrenamiento K-Means completado exitosamente",
            "resultado": resultado_entrenamiento
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Error durante el entrenamiento",
            "detalle": str(e)
        }), 500


@app.route("/reportes/eficiencia-modelo", methods=["GET"])
def eficiencia_modelo():
    try:
        return jsonify(reporte_eficiencia_modelo(resultado_entrenamiento)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/reportes/distribucion-clusters", methods=["GET"])
def distribucion_clusters():
    try:
        return jsonify(reporte_distribucion_clusters(resultado_entrenamiento)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/reportes/perfil-numerico", methods=["GET"])
def perfil_numerico():
    try:
        return jsonify(reporte_perfil_numerico(resultado_entrenamiento)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/reportes/analisis-reseñas", methods=["GET"])
def analisis_reseñas():
    try:
        return jsonify(reporte_analisis_reseñas(resultado_entrenamiento)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/reportes/descripciones", methods=["GET"])
def descripciones():
    try:
        return jsonify(reporte_descripciones_clusters(resultado_entrenamiento)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)