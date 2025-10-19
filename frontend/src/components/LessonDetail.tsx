import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface LessonPlan {
  titulo_plano: string
  tema_principal: string
  publico_alvo: string
  duracao_estimada: string
  introducao_ludica: {
    titulo: string
    descricao: string
  }
  objetivo_bncc: {
    codigo: string
    descricao: string
  }
  passos_da_atividade: Array<{
    passo: number
    titulo: string
    duracao_sugerida: string
    detalhamento: string
  }>
  rubrica_avaliacao: {
    foco_da_avaliacao: string
    criterios: Array<{
      nivel: string
      descricao: string
    }>
  }
  materiais_necessarios: string
}

interface LessonDetailProps {
  lessonId: number
  onBack: () => void
}

export default function LessonDetail({ lessonId, onBack }: LessonDetailProps) {
  const [lesson, setLesson] = useState<LessonPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessonDetail()
  }, [lessonId])

  const fetchLessonDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('planos_de_aula')
        .select('plano_json')
        .eq('id', lessonId)
        .single()

      if (error) {
        console.error('Erro ao buscar detalhes:', error)
      } else {
        setLesson(data.plano_json)
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="mb-4 text-blue-600 hover:underline cursor-pointer">
            ← Voltar
          </button>
          <div className="text-center">Aula não encontrada</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-4 text-blue-600 hover:underline cursor-pointer">
          ← Voltar ao painel
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold">{lesson.titulo_plano}</h1>
            <div className="mt-2 text-gray-600">
              <p><strong>Tema:</strong> {lesson.tema_principal}</p>
              <p><strong>Público:</strong> {lesson.publico_alvo}</p>
              <p><strong>Duração:</strong> {lesson.duracao_estimada}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Introdução Lúdica</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium">{lesson.introducao_ludica.titulo}</h3>
              <p className="mt-2">{lesson.introducao_ludica.descricao}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Objetivo BNCC</h2>
            <div className="bg-green-50 p-4 rounded-lg">
              <p><strong>Código:</strong> {lesson.objetivo_bncc.codigo}</p>
              <p className="mt-2">{lesson.objetivo_bncc.descricao}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Passos da Atividade</h2>
            <div className="space-y-4">
              {lesson.passos_da_atividade.map((passo) => (
                <div key={passo.passo} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium">{passo.titulo}</h3>
                  <p className="text-sm text-gray-600">Duração: {passo.duracao_sugerida}</p>
                  <p className="mt-2">{passo.detalhamento}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Rubrica de Avaliação</h2>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p><strong>Foco:</strong> {lesson.rubrica_avaliacao.foco_da_avaliacao}</p>
              <div className="mt-3 space-y-2">
                {lesson.rubrica_avaliacao.criterios.map((criterio, index) => (
                  <div key={index} className="border-l-2 border-yellow-400 pl-3">
                    <p className="font-medium">{criterio.nivel}</p>
                    <p className="text-sm">{criterio.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Materiais Necessários</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{lesson.materiais_necessarios}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}