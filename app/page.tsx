// Caminho do arquivo: app/page.tsx
'use client' 

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client' // Este caminho agora está correto

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
  const [email, setEmail] = useState('')
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

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Login bem-sucedido! Redirecionando...')
      window.location.href = '/dashboard' 
    }
    setLoading(false)
  }

  return (
    // O 'children' do layout agora está em um <main>, 
    // então ajustamos o container do login para preencher a altura disponível
    <div className="flex h-full items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          {/* Branding Atualizado */}
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@orgao.gov.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
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