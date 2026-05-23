'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminIndexPage() {
  return (
    <div className="min-h-screen py-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Administración</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-4">Acciones rápidas de administración</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button asChild className="w-full">
            <Link href="/admin/votantes">Ver votantes</Link>
          </Button>

          <Button asChild className="w-full">
            <Link href="/admin/padron">Subir padrón</Link>
          </Button>

          <Button asChild className="w-full">
            <Link href="/admin/candidatos">Modificar candidatos</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
