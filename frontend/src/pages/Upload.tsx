"use client"

import { useState, type ChangeEvent } from "react"
import { UploadIcon, FileText, Loader2, CheckCircle, AlertCircle, Settings } from "lucide-react"

const API_URL = "http://127.0.0.1:5000"

interface UploadResponse {
    archivo: string
    filas: number
    mensaje: string
    columnas: string[]
}

interface TrainResponse {
    mensaje: string
    num_clusters: number
}

export function Upload() {
    const [file, setFile] = useState<File | null>(null)
    const [resultado, setResultado] = useState<UploadResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [cleaning, setCleaning] = useState(false)
    const [training, setTraining] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [trainResult, setTrainResult] = useState<TrainResponse | null>(null)
    const [cleaningDone, setCleaningDone] = useState(false)

    // Parámetros del modelo con valores por defecto
    const [nClusters, setNClusters] = useState(5)
    const [randomState, setRandomState] = useState(42)
    const [nInit, setNInit] = useState(20)
    const [kMax, setKMax] = useState(12)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            // Validar que sea CSV
            if (!selectedFile.name.endsWith(".csv")) {
                setError("Por favor seleccione un archivo CSV válido")
                setFile(null)
                return
            }
            setFile(selectedFile)
            setError(null)
            setResultado(null)
            setTrainResult(null)
            setCleaningDone(false)
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch(`${API_URL}/carga-masiva`, {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Error al cargar el archivo")
            }

            const data: UploadResponse = await response.json()
            setResultado(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido")
        } finally {
            setLoading(false)
        }
    }

    const handleClean = async () => {
        setCleaning(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/clean`, {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Error al limpiar los datos")
            }

            const data = await response.json()
            console.log(" Datos limpiados:", data)
            setCleaningDone(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al limpiar datos")
        } finally {
            setCleaning(false)
        }
    }

    const handleTrain = async () => {
        setTraining(true)
        setError(null)

        try {
            console.log("data", {
                n_clusters: nClusters,
                random_state: randomState,
                n_init: nInit,
                k_max: kMax,
            })
            const response = await fetch(`${API_URL}/entrenar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    n_clusters: nClusters,
                    random_state: randomState,
                    n_init: nInit,
                    k_max: kMax,
                }),
            })

            if (!response.ok) {
                throw new Error("Error al entrenar el modelo")
            }

            const data: TrainResponse = await response.json()
            setTrainResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al entrenar el modelo")
        } finally {
            setTraining(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Cargar y Entrenar Modelo</h1>

                {/* Sección de carga de archivo */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-400" />
                        Paso 1: Cargar Archivo CSV
                    </h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Seleccione su archivo CSV</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-600 file:text-white
                hover:file:bg-indigo-700
                file:cursor-pointer cursor-pointer"
                        />
                    </div>

                    {file && (
                        <div className="flex items-center gap-2 text-sm text-slate-300 mb-4">
                            <FileText className="w-4 h-4" />
                            <span>{file.name}</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 mb-4">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Cargando...
                            </>
                        ) : (
                            <>
                                <UploadIcon className="w-5 h-5" />
                                Cargar Archivo
                            </>
                        )}
                    </button>
                </div>

                {/* Resultado de carga */}
                {resultado && (
                    <>
                        <div className="bg-slate-900/50 border border-green-800/50 rounded-xl p-8 mb-6">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Archivo Cargado Exitosamente</h3>
                                    <p className="text-slate-300">{resultado.mensaje}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <p className="text-sm text-slate-400">Archivo</p>
                                    <p className="text-lg font-semibold text-white">{resultado.archivo}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <p className="text-sm text-slate-400">Filas Cargadas</p>
                                    <p className="text-lg font-semibold text-white">{resultado.filas}</p>
                                </div>
                            </div>

                            {resultado.columnas && (
                                <div className="mt-4">
                                    <p className="text-sm text-slate-400 mb-2">Columnas detectadas:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {resultado.columnas.map((col, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-sm">
                                                {col}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Configuración de parámetros */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-6">
                            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-indigo-400" />
                                Paso 2: Configurar Parámetros del Modelo
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Número de Clusters (n_clusters)
                                    </label>
                                    <input
                                        type="number"
                                        value={nClusters}
                                        onChange={(e) => setNClusters(Number.parseInt(e.target.value) || 5)}
                                        min="2"
                                        max="20"
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Número de segmentos a crear (por defecto: 5)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Random State (random_state)</label>
                                    <input
                                        type="number"
                                        value={randomState}
                                        onChange={(e) => setRandomState(Number.parseInt(e.target.value) || 42)}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Semilla para reproducibilidad (por defecto: 42)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Número de Inicializaciones (n_init)
                                    </label>
                                    <input
                                        type="number"
                                        value={nInit}
                                        onChange={(e) => setNInit(Number.parseInt(e.target.value) || 20)}
                                        min="1"
                                        max="100"
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Número de ejecuciones del algoritmo (por defecto: 20)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">K Máximo (k_max)</label>
                                    <input
                                        type="number"
                                        value={kMax}
                                        onChange={(e) => setKMax(Number.parseInt(e.target.value) || 12)}
                                        min="2"
                                        max="30"
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        Máximo número de clusters para evaluación (por defecto: 12)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Entrenar modelo */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-indigo-400" />
                                Paso 3: Entrenar Modelo
                            </h2>

                            <p className="text-slate-300 mb-4">
                                Ejecute el algoritmo K-Means con los parámetros configurados para generar los segmentos de clientes.
                            </p>

                            {trainResult && (
                                <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">Modelo Entrenado Exitosamente</h3>
                                            <p className="text-slate-300">{trainResult.mensaje}</p>
                                            <p className="text-slate-300 mt-2">
                                                Clusters generados:{" "}
                                                <span className="font-semibold text-indigo-400">{trainResult.num_clusters}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleTrain}
                                disabled={training}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                {training ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Entrenando Modelo...
                                    </>
                                ) : (
                                    <>
                                        <Settings className="w-5 h-5" />
                                        Entrenar Modelo
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
