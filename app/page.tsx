// Caminho do arquivo: src/app/page.tsx
'use client' // Diretiva importante: indica que este é um componente interativo

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client' // Importa nosso cliente

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient() // Inicializa o Supabase

  // Função para lidar com o login (Sign In)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault() // Impede o recarregamento da página
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Login bem-sucedido! Redirecionando...')
      // No futuro, faremos o redirecionamento aqui
      window.location.href = '/dashboard' // Redireciona para a página principal
    }
  }

  // Função para lidar com o cadastro (Sign Up)
  // Nota: Você precisará cadastrar seus 4 usuários manualmente
  // ou usar esta função temporariamente.
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Usuário cadastrado! Verifique seu e-mail para confirmação.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          SGCO
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Sistema de Gerenciamento de Créditos Orçamentários
        </p>
        
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="seu.email@orgao.gov.br"
            />
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-md bg-green-100 p-3 text-center text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Entrar
          </button>
        </form>

        {/* Botão de Cadastro (Sign Up) 
          Mantenha-o comentado (ou remova) se for cadastrar usuários
          diretamente no painel do Supabase.
        */}
        {/*
        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem conta?
          <button onClick={handleSignUp} className="ml-1 font-medium text-blue-600 hover:underline">
            Cadastrar (Teste)
          </button>
        </p>
        */}
      </div>
    </div>
  )
}