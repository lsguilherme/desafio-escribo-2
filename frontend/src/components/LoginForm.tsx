import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface LoginFormProps {
  onToggleMode: () => void
  onLogin: () => void
}

export default function LoginForm({ onToggleMode, onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        alert(error.message)
      }
    } catch (error) {
      alert('Erro no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-2">Bem-vindo</h2>
        <p className="text-gray-600">Faça login para continuar</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg cursor-pointer"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Não tem conta?{' '}
          <button
            onClick={onToggleMode}
            className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-200 cursor-pointer"
          >
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  )
}