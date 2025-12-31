import { Routes, Route, Link, useLocation } from "react-router-dom"
import { Home } from "./pages/Home"
import { Upload } from "./pages/Upload"
import { Reports } from "./pages/Reports"
import { Brain, UploadIcon, BarChart3 } from "lucide-react"

export default function App() {
    const location = useLocation()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
            <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Brain className="w-8 h-8 text-indigo-400" />
                            <span className="text-xl font-bold text-white">InsightCluster</span>
                        </div>
                        <div className="flex gap-1">
                            <Link
                                to="/"
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${location.pathname === "/" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                                    }`}
                            >
                                <Brain className="w-4 h-4" />
                                Inicio
                            </Link>
                            <Link
                                to="/upload"
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${location.pathname === "/upload" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                                    }`}
                            >
                                <UploadIcon className="w-4 h-4" />
                                Cargar Datos
                            </Link>
                            <Link
                                to="/reports"
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${location.pathname === "/reports" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                Reportes
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/reports" element={<Reports />} />
                </Routes>
            </main>
        </div>
    )
}
