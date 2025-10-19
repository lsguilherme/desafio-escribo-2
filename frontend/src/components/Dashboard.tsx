import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PresentationForm from './PresentationForm'
import LessonDetail from './LessonDetail'

interface Lesson {
  id: number
  tema: string
  publico_alvo: string
  duracao: string
  created_at: string
}

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('planos_de_aula')
        .select('id, tema, publico_alvo, duracao, data_geracao')
        .eq('user_id', user.id)
        .order('data_geracao', { ascending: false })

      if (error) {
        console.error('Erro ao buscar aulas:', error)
      } else {
        setLessons(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLessonCreated = () => {
    setShowForm(false)
    fetchLessons()
  }

  if (selectedLessonId) {
    return (
      <LessonDetail
        lessonId={selectedLessonId}
        onBack={() => setSelectedLessonId(null)}
      />
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 text-blue-600 hover:underline"
          >
            ← Voltar ao painel
          </button>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <PresentationForm onLogout={onLogout} onSuccess={handleLessonCreated} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-600">Painel de Aulas</h1>
              <p className="text-gray-600 mt-1">Gerencie seus planos de aula com IA</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span className="text-xl">+</span> Nova Aula
              </button>
              <button
                onClick={onLogout}
                className="text-red-600 hover:text-red-700 px-4 py-3 rounded-xl hover:bg-red-50 transition-all duration-200 font-medium cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-2xl font-bold text-gray-800">Minhas Aulas</h2>
            <p className="text-gray-600 mt-1">Seus planos de aula criados</p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando suas aulas...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center">

              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma aula criada ainda</h3>
              <p className="text-gray-500 mb-6">Comece criando seu primeiro plano de aula com IA</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg cursor-pointer"
              >
                Criar primeira aula
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="mb-2">
                        <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-700 transition-colors">{lesson.tema}</h3>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">
                          Público: {lesson.publico_alvo}
                        </p>
                        {lesson.duracao && (
                          <p className="text-gray-600">
                            Duração: {lesson.duracao}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">
                          Criado em: {new Date(lesson.data_geracao).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-md cursor-pointer"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}