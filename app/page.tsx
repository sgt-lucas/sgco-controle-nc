// Caminho do arquivo: app/page.tsx (Atualizado para Usuário/Senha)
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client' // Caminho correto

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  // Estado renomeado de 'email' para 'username'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    // Passa o 'username' do estado para o campo 'email' esperado pelo Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: username, // <- Mudança aqui
      password: password,
    })

    if (error) {
      // Mensagem de erro genérica para não vazar se o usuário existe ou não
      setError('Usuário ou senha inválidos.')
      console.error("Erro de login:", error.message) // Log detalhado no console do navegador
    } else {
      setMessage('Login bem-sucedido! Redirecionando...')
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <div className="flex h-full items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            2º CENTRO DE GEOINFORMAÇÃO
          </CardTitle>
          <CardDescription>
            Controle Orçamentário - SALC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn}>
            <div className="grid w-full items-center gap-4">
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text" // <- Mudado de 'email' para 'text'
                  placeholder="Seu nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              {/* Campo de Senha (sem alterações) */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-md border border-green-300 bg-green-50 p-3 text-center text-sm text-green-700">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}