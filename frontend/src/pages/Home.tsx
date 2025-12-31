import { Brain, Upload, Settings, BarChart3 } from "lucide-react"
import { Link } from "react-router-dom"

export function Home() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">InsightCluster</h1>
                    <p className="text-xl text-slate-300">Sistema de Análisis y Segmentación de Clientes con K-Means</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Instrucciones de Uso</h2>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-indigo-400" />
                                    Cargar Archivo CSV
                                </h3>
                                <p className="text-slate-300">
                                    Navegue a la sección "Cargar Datos" y seleccione su archivo CSV con datos de clientes. Solo se aceptan
                                    archivos .csv. El sistema validará automáticamente el formato.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-indigo-400" />
                                    Limpiar y Configurar
                                </h3>
                                <p className="text-slate-300">
                                    Opcionalmente, puede limpiar los datos para eliminar valores nulos o inconsistentes. Luego, configure
                                    los parámetros del modelo K-Means según sus necesidades o use los valores predeterminados.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-indigo-400" />
                                    Entrenar Modelo
                                </h3>
                                <p className="text-slate-300">
                                    Haga clic en "Entrenar Modelo" para ejecutar el algoritmo de clustering. El sistema procesará sus
                                    datos y generará los segmentos de clientes.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                4
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                                    Ver Reportes
                                </h3>
                                <p className="text-slate-300">
                                    Una vez entrenado el modelo, navegue a "Reportes" para visualizar las métricas de eficiencia,
                                    distribución de clusters, perfiles numéricos, análisis de reseñas y descripciones detalladas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
                        <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4">
                            <Brain className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">K-Means Clustering</h3>
                        <p className="text-slate-400 text-sm">
                            Algoritmo de aprendizaje no supervisado para segmentación automática de clientes
                        </p>
                    </div>

                    <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
                        <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4">
                            <BarChart3 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Métricas Avanzadas</h3>
                        <p className="text-slate-400 text-sm">
                            Análisis de eficiencia con Silhouette Score, Davies-Bouldin y Calinski-Harabasz
                        </p>
                    </div>

                    <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
                        <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4">
                            <Settings className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Configuración Flexible</h3>
                        <p className="text-slate-400 text-sm">
                            Ajuste los parámetros del modelo para optimizar los resultados según sus datos
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        to="/upload"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                        Comenzar Análisis
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Home
