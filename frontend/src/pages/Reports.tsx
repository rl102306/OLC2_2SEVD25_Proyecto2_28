"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Users, MessageSquare, FileText, Loader2, AlertCircle } from "lucide-react"

const API_URL = "http://127.0.0.1:5000"

interface Metricas {
    calinski_harabasz: number
    davies_bouldin: number
    silhouette_score: number
}

interface Interpretacion {
    davies_bouldin: string
    silhouette: string
}

interface EficienciaData {
    metricas: Metricas
    interpretacion: Interpretacion
}

interface ClusterDistribucion {
    cluster: number
    cantidad: number
    porcentaje: number
}

interface DistribucionData {
    clusters: ClusterDistribucion[]
    total_clientes: number
}

interface PerfilNumerico {
    cluster: number
    antiguedad_cliente_meses: number
    dias_desde_ultima_compra: number
    frecuencia_compra: number
    monto_promedio_compra: number
    monto_total_gastado: number
    numero_productos_distintos: number
}

interface PalabraFrecuente {
    0: string
    1: number
}

interface ClusterResena {
    cluster: number
    cantidad_reseñas: number
    palabras_frecuentes: [string, number][]
}

interface AnalisisResenasData {
    clusters: ClusterResena[]
}

interface ClusterDescripcion {
    cluster: number
    descripcion: string
}

interface DescripcionesData {
    clusters: ClusterDescripcion[]
}

type ReportType = "eficiencia" | "distribucion" | "perfil" | "resenas" | "descripciones"

export function Reports() {
    const [activeReport, setActiveReport] = useState<ReportType>("eficiencia")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [eficienciaData, setEficienciaData] = useState<EficienciaData | null>(null)
    const [distribucionData, setDistribucionData] = useState<DistribucionData | null>(null)
    const [perfilData, setPerfilData] = useState<{ clusters: PerfilNumerico[] } | null>(null)
    const [resenasData, setResenasData] = useState<AnalisisResenasData | null>(null)
    const [descripcionesData, setDescripcionesData] = useState<DescripcionesData | null>(null)

    useEffect(() => {
        fetchReport(activeReport)
    }, [activeReport])

    const fetchReport = async (type: ReportType) => {
        setLoading(true)
        setError(null)

        try {
            let endpoint = ""
            switch (type) {
                case "eficiencia":
                    endpoint = "/reportes/eficiencia-modelo"
                    break
                case "distribucion":
                    endpoint = "/reportes/distribucion-clusters"
                    break
                case "perfil":
                    endpoint = "/reportes/perfil-numerico"
                    break
                case "resenas":
                    endpoint = "/reportes/analisis-reseñas"
                    break
                case "descripciones":
                    endpoint = "/reportes/descripciones"
                    break
            }

            const response = await fetch(`${API_URL}${endpoint}`)

            if (!response.ok) {
                throw new Error(`Error al cargar el reporte: ${response.statusText}`)
            }

            const data = await response.json()

            switch (type) {
                case "eficiencia":
                    setEficienciaData(data)
                    break
                case "distribucion":
                    setDistribucionData(data)
                    break
                case "perfil":
                    setPerfilData(data)
                    break
                case "resenas":
                    setResenasData(data)
                    break
                case "descripciones":
                    setDescripcionesData(data)
                    break
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido al cargar reporte")
        } finally {
            setLoading(false)
        }
    }

    const reportButtons = [
        { id: "eficiencia" as ReportType, label: "Eficiencia del Modelo", icon: TrendingUp },
        { id: "distribucion" as ReportType, label: "Distribución de Clusters", icon: BarChart3 },
        { id: "perfil" as ReportType, label: "Perfil Numérico", icon: Users },
        { id: "resenas" as ReportType, label: "Análisis de Reseñas", icon: MessageSquare },
        { id: "descripciones" as ReportType, label: "Descripciones", icon: FileText },
    ]

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Reportes del Modelo</h1>

                {/* Selector de reportes */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {reportButtons.map((btn) => {
                        const Icon = btn.icon
                        return (
                            <button
                                key={btn.id}
                                onClick={() => setActiveReport(btn.id)}
                                className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${activeReport === btn.id
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-900/50 border border-slate-800 text-slate-300 hover:bg-slate-800"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {btn.label}
                            </button>
                        )
                    })}
                </div>

                {/* Contenido del reporte */}
                {loading ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                        <span className="ml-3 text-slate-300">Cargando reporte...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-8">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Error al cargar el reporte</h3>
                                <p className="text-slate-300">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeReport === "eficiencia" && eficienciaData && (
                            <div className="space-y-6">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                                    <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                                        <TrendingUp className="w-6 h-6 text-indigo-400" />
                                        Métricas de Eficiencia del Modelo
                                    </h2>

                                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-slate-800/50 rounded-lg p-6">
                                            <p className="text-sm text-slate-400 mb-2">Silhouette Score</p>
                                            <p className="text-3xl font-bold text-white mb-2">
                                                {eficienciaData.metricas.silhouette_score.toFixed(4)}
                                            </p>
                                            <p className="text-sm text-slate-300">{eficienciaData.interpretacion.silhouette}</p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-lg p-6">
                                            <p className="text-sm text-slate-400 mb-2">Davies-Bouldin Index</p>
                                            <p className="text-3xl font-bold text-white mb-2">
                                                {eficienciaData.metricas.davies_bouldin.toFixed(4)}
                                            </p>
                                            <p className="text-sm text-slate-300">{eficienciaData.interpretacion.davies_bouldin}</p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-lg p-6">
                                            <p className="text-sm text-slate-400 mb-2">Calinski-Harabasz Score</p>
                                            <p className="text-3xl font-bold text-white mb-2">
                                                {eficienciaData.metricas.calinski_harabasz.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-slate-300">Índice de separación de clusters</p>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-3">Interpretación</h3>
                                        <ul className="space-y-2 text-slate-300">
                                            <li className="flex items-start gap-2">
                                                <span className="text-indigo-400 mt-1">•</span>
                                                <span>
                                                    <strong>Silhouette Score:</strong> Valores cercanos a 1 indican clusters bien definidos.{" "}
                                                    {eficienciaData.interpretacion.silhouette}
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-indigo-400 mt-1">•</span>
                                                <span>
                                                    <strong>Davies-Bouldin:</strong> Valores más bajos son mejores.{" "}
                                                    {eficienciaData.interpretacion.davies_bouldin}
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-indigo-400 mt-1">•</span>
                                                <span>
                                                    <strong>Calinski-Harabasz:</strong> Valores más altos indican mejor separación entre clusters.
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeReport === "distribucion" && distribucionData && (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-indigo-400" />
                                    Distribución de Clusters
                                </h2>

                                <div className="mb-6">
                                    <p className="text-lg text-slate-300">
                                        Total de clientes: <span className="font-bold text-white">{distribucionData.total_clientes}</span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {distribucionData.clusters.map((cluster) => (
                                        <div key={cluster.cluster} className="bg-slate-800/50 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-semibold text-white">Cluster {cluster.cluster}</h3>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-indigo-400">{cluster.porcentaje}%</p>
                                                    <p className="text-sm text-slate-400">{cluster.cantidad} clientes</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-3">
                                                <div
                                                    className="bg-indigo-600 h-3 rounded-full transition-all"
                                                    style={{ width: `${cluster.porcentaje}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeReport === "perfil" && perfilData && (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-indigo-400" />
                                    Perfil Numérico de Clusters
                                </h2>

                                <div className="space-y-6">
                                    {perfilData.clusters.map((cluster) => (
                                        <div key={cluster.cluster} className="bg-slate-800/50 rounded-lg p-6">
                                            <h3 className="text-xl font-semibold text-white mb-4">Cluster {cluster.cluster}</h3>

                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="bg-slate-900/50 rounded p-4">
                                                    <p className="text-xs text-slate-400 mb-1">Frecuencia de Compra</p>
                                                    <p className="text-lg font-bold text-white">{cluster.frecuencia_compra.toFixed(2)}</p>
                                                </div>

                                                <div className="bg-slate-900/50 rounded p-4">
                                                    <p className="text-xs text-slate-400 mb-1">Monto Total Gastado</p>
                                                    <p className="text-lg font-bold text-white">${cluster.monto_total_gastado.toFixed(2)}</p>
                                                </div>

                                                <div className="bg-slate-900/50 rounded p-4">
                                                    <p className="text-xs text-slate-400 mb-1">Monto Promedio</p>
                                                    <p className="text-lg font-bold text-white">${cluster.monto_promedio_compra.toFixed(2)}</p>
                                                </div>

                                                <div className="bg-slate-900/50 rounded p-4">
                                                    <p className="text-xs text-slate-400 mb-1">Días desde Última Compra</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {cluster.dias_desde_ultima_compra.toFixed(0)} días
                                                    </p>
                                                </div>

                                                <div className="bg-slate-900/50 rounded p-4">
                                                    <p className="text-xs text-slate-400 mb-1">Antigüedad del Cliente</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {cluster.antiguedad_cliente_meses.toFixed(0)} meses
                                                    </p>
                                                </div>

                                                <div className="bg-slate-900/50 rounded p-4">
                                                    <p className="text-xs text-slate-400 mb-1">Productos Distintos</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {cluster.numero_productos_distintos.toFixed(0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeReport === "resenas" && resenasData && (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <MessageSquare className="w-6 h-6 text-indigo-400" />
                                    Análisis de Reseñas por Cluster
                                </h2>

                                <div className="space-y-6">
                                    {resenasData.clusters.map((cluster) => (
                                        <div key={cluster.cluster} className="bg-slate-800/50 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-semibold text-white">Cluster {cluster.cluster}</h3>
                                                <p className="text-sm text-slate-400">{cluster.cantidad_reseñas} reseñas</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-slate-400 mb-3">Palabras más frecuentes:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {cluster.palabras_frecuentes.slice(0, 10).map(([palabra, frecuencia], idx) => (
                                                        <div
                                                            key={idx}
                                                            className="px-4 py-2 bg-indigo-900/30 border border-indigo-800/50 rounded-full"
                                                        >
                                                            <span className="text-white font-semibold">{palabra}</span>
                                                            <span className="text-indigo-400 ml-2">({frecuencia})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeReport === "descripciones" && descripcionesData && (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-indigo-400" />
                                    Descripciones de Clusters
                                </h2>

                                <div className="space-y-4">
                                    {descripcionesData.clusters.map((cluster) => (
                                        <div key={cluster.cluster} className="bg-slate-800/50 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold text-indigo-400 mb-3">Cluster {cluster.cluster}</h3>
                                            <p className="text-slate-300 leading-relaxed">{cluster.descripcion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Reports
