// Caminho do arquivo: app/page.tsx (Com Logo)
'use client'

import { useState } from 'react'
import Image from 'next/image' // Importa o componente Image
import { createClient } from '@/lib/supabase/client'

import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const DOMAIN_SUFFIX = '@salc.com';

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => { /* ... (lógica de login inalterada) ... */
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    const emailWithSuffix = `${username}${DOMAIN_SUFFIX}`;
    const { error } = await supabase.auth.signInWithPassword({
      email: emailWithSuffix,
      password: password,
    })
    if (error) {
      setError('Usuário ou senha inválidos.')
      console.error("Erro de login:", error.message)
    } else {
      setMessage('Login bem-sucedido! Redirecionando...')
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
       <div className="mb-8">
            <Image
                src="/logo-2cgeo.png" // Caminho relativo à pasta /public
                alt="Distintivo 2º CGEO"
                width={120} height={150} // Ajuste conforme necessário
                priority
            />
       </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold"> 2º CENTRO DE GEOINFORMAÇÃO </CardTitle>
          <CardDescription> Controle Orçamentário - SALC </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5"> <Label htmlFor="username">Usuário</Label> <Input id="username" type="text" placeholder="Seu nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => { if (e.key === '@') e.preventDefault(); }} required /> </div>
              <div className="flex flex-col space-y-1.5"> <Label htmlFor="password">Senha</Label> <Input id="password" type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required /> </div>
              {error && (<div className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700"> {error} </div>)}
              {message && (<div className="rounded-md border border-green-300 bg-green-50 p-3 text-center text-sm text-green-700"> {message} </div>)}
              <Button type="submit" className="w-full" disabled={loading}> {loading ? 'Entrando...' : 'Entrar'} </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}