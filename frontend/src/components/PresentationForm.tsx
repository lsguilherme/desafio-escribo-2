import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

interface PresentationFormProps {
  onLogout: () => void
  onSuccess?: () => void
}

export default function PresentationForm({ onLogout, onSuccess }: PresentationFormProps) {
  const [tema, setTema] = useState('')
  const [publico, setPublico] = useState('')
  const [duracao, setDuracao] = useState('')
  const [materiais, setMateriais] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(tema, publico, duracao, materiais)
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('super-task', {
        body: {
          tema,
          publico_alvo: publico,
          duracao: duracao || null,
          materiais_disponiveis: materiais || null
        }
      })

      if (error && error instanceof FunctionsHttpError) {
        const errorMessage = await error.context.json()
        console.log('Function returned an error', errorMessage)
      }
      if (error) {
        console.error('Edge Function Error:', error)
        alert('Erro: ' + error.message)
      } else {
        console.log('Presentation generated:', data)
        alert('Apresentação gerada com sucesso!')
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      console.error('Catch Error:', error)
      alert('Erro ao gerar apresentação: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Nova Apresentação</h2>
        <button
          onClick={onLogout}
          className="text-sm text-red-600 hover:underline cursor-pointer"
        >
          Sair
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tema *</label>
          <input
            type="text"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Público *</label>
          <input
            type="text"
            value={publico}
            onChange={(e) => setPublico(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duração estimada</label>
          <input
            type="text"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 30 minutos"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Materiais disponíveis</label>
          <textarea
            value={materiais}
            onChange={(e) => setMateriais(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Descreva os materiais disponíveis..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? 'Gerando...' : 'Criar Apresentação'}
        </button>
      </form>
    </div>
  )
}