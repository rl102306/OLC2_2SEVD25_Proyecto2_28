import { useState } from "react";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000";

interface ResumenLimpieza {
  duplicados_eliminados: number;
  nulos_manejados: Record<string, number>;
  outliers_tratados: Record<string, any>;
  filas_iniciales: number;
  filas_finales: number;
  columnas_iniciales: number;
  columnas_finales: number;
  features_tfidf_generadas: number;
}

interface RespuestaCarga {
  mensaje: string;
  resumen_limpieza: ResumenLimpieza;
  vista_previa: Record<string, any>[];
  columnas_finales: string[];
}

const CargaMasiva = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespuestaCarga | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const subirArchivo = async () => {
    if (!file) {
      setMessage("⚠️ Seleccione un archivo CSV");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage(null);
      setResultado(null);

      const response = await fetch(`${API_URL}/carga-masiva`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data: RespuestaCarga = await response.json();
      setResultado(data);
      setMessage("✅ " + data.mensaje);
    } catch (error: any) {
      console.error("Error al subir archivo:", error);
      setMessage(`❌ Error al subir archivo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpiarDatos = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await fetch(`${API_URL}/clean`, { method: "POST" });
      setMessage("🧹 Datos limpiados correctamente");
    } catch {
      setMessage("❌ Error al limpiar datos");
    } finally {
      setLoading(false);
    }
  };

  const entrenarModelo = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const response = await fetch(`${API_URL}/entrenar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelo: "random_forest" }),
      });

      if (!response.ok) throw new Error("Error al entrenar el modelo");

      const data = await response.json();
      setPopupMessage(data.mensaje);
      setShowPopup(true);

      sessionStorage.setItem(
        "metricasModelo",
        JSON.stringify({
          metricas: data.metricas,
          modelo: data.modelo,
        })
      );
    } catch (error: any) {
      setMessage("❌ Error al entrenar modelo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ padding: "40px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "30px" }}>Carga Masiva</h1>

        <div style={{ display: "flex", gap: "80px", alignItems: "center", marginBottom: "40px" }}>
          <label style={uploadStyle}>
            <span style={{ fontSize: "48px" }}>☁️</span>
            <p style={{ marginTop: "12px", fontWeight: 500 }}>
              {file ? file.name : "Subir archivo CSV"}
            </p>
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button onClick={subirArchivo} disabled={loading} style={buttonStyle}>
              ⬆️ Subir archivo
            </button>
            <button onClick={limpiarDatos} disabled={loading} style={buttonStyle}>
              🧹 Limpiar datos
            </button>
            <button onClick={entrenarModelo} disabled={loading} style={buttonStyle}>
              🤖 Entrenar modelo
            </button>
          </div>
        </div>

        {message && (
          <p style={{ margin: "20px 0", fontWeight: 500, fontSize: "18px" }}>
            {message}
          </p>
        )}

        {resultado && (
          <div style={{ marginTop: "40px", background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginBottom: "20px" }}>📊 Resultado de la Carga y Limpieza</h2>

            <div style={{ marginBottom: "24px" }}>
              <h3>Resumen General</h3>
              <ul style={{ lineHeight: "1.8" }}>
                <li><strong>Filas iniciales:</strong> {resultado.resumen_limpieza.filas_iniciales} → <strong>Filas finales:</strong> {resultado.resumen_limpieza.filas_finales}</li>
                <li><strong>Columnas iniciales:</strong> {resultado.resumen_limpieza.columnas_iniciales} → <strong>Columnas finales:</strong> {resultado.resumen_limpieza.columnas_finales}</li>
                <li><strong>Duplicados eliminados:</strong> {resultado.resumen_limpieza.duplicados_eliminados}</li>
                <li><strong>Features TF-IDF generadas:</strong> {resultado.resumen_limpieza.features_tfidf_generadas}</li>
              </ul>
            </div>

            {Object.keys(resultado.resumen_limpieza.nulos_manejados).length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3>Valores nulos manejados</h3>
                <ul>
                  {Object.entries(resultado.resumen_limpieza.nulos_manejados).map(([col, cant]) => (
                    <li key={col}><strong>{col}:</strong> {cant} valores imputados</li>
                  ))}
                </ul>
              </div>
            )}

            {Object.keys(resultado.resumen_limpieza.outliers_tratados).length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3>Outliers tratados (método: clipping)</h3>
                <ul>
                  {Object.keys(resultado.resumen_limpieza.outliers_tratados).map((col) => (
                    <li key={col}><strong>{col}</strong>: valores ajustados al rango IQR</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: "32px" }}>
              <h3>📋 Vista previa de los datos procesados (primeras 3 filas)</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                      {resultado.columnas_finales.slice(0, 15).map((col) => ( // Limitamos a 15 columnas para no romper el layout
                        <th key={col} style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                          {col}
                        </th>
                      ))}
                      {resultado.columnas_finales.length > 15 && (
                        <th style={{ padding: "10px", border: "1px solid #ddd" }}>... ({resultado.columnas_finales.length - 15} más)</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.vista_previa.map((row, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                        {resultado.columnas_finales.slice(0, 15).map((col) => (
                          <td key={col} style={{ padding: "10px", border: "1px solid #ddd", fontSize: "14px" }}>
                            {typeof row[col] === "number" ? row[col].toFixed(2) : String(row[col])}
                          </td>
                        ))}
                        {resultado.columnas_finales.length > 15 && <td>...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Popup de entrenamiento */}
      {showPopup && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h3>🤖 Entrenamiento Completado</h3>
            <p style={{ margin: "15px 0" }}>{popupMessage}</p>
            <button style={buttonStyle} onClick={() => setShowPopup(false)}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const buttonStyle = {
  padding: "14px 24px",
  fontSize: "15px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#374151",
  color: "white",
  cursor: "pointer",
};

const uploadStyle = {
  width: "260px",
  height: "260px",
  border: "2px dashed #9ca3af",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backgroundColor: "#ffffff",
};

const overlayStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const popupStyle = {
  background: "#fff",
  padding: "25px",
  borderRadius: "10px",
  minWidth: "320px",
  textAlign: "center" as const,
};

export default CargaMasiva;