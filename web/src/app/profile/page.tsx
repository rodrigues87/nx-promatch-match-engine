"use client"

import { useState } from "react"
import { mockUser } from "@/mocks/users"

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser)
  const [newSkill, setNewSkill] = useState("")
  const [saved, setSaved] = useState(false)

  const addSkill = (skill: string) => {
    if (skill && !user.skills.includes(skill)) {
      setUser({ ...user, skills: [...user.skills, skill] })
    }
    setNewSkill("")
  }

  const removeSkill = (skill: string) => {
    setUser({ ...user, skills: user.skills.filter((s) => s !== skill) })
  }

  const handleSave = () => {
    // Mock: simula salvamento
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Meu Perfil</h1>

      <div className="space-y-8">
        {/* Dados pessoais */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
              <input
                type="text"
                value={user.location}
                onChange={(e) => setUser({ ...user, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </section>

        {/* Preferências */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferências</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salário mínimo (R$)
              </label>
              <input
                type="number"
                value={user.salaryMin}
                onChange={(e) => setUser({ ...user, salaryMin: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anos de experiência
              </label>
              <input
                type="number"
                value={user.experienceYears}
                onChange={(e) => setUser({ ...user, experienceYears: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Modelo de trabalho</label>
            <div className="flex gap-3">
              {["remoto", "hibrido", "presencial"].map((model) => (
                <button
                  key={model}
                  onClick={() => {
                    const models = user.workModels.includes(model)
                      ? user.workModels.filter((m) => m !== model)
                      : [...user.workModels, model]
                    setUser({ ...user, workModels: models })
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    user.workModels.includes(model)
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {model === "remoto" ? "Remoto" : model === "hibrido" ? "Híbrido" : "Presencial"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Qualificações</h2>

          <div className="flex flex-wrap gap-2 min-h-[48px] mb-4">
            {user.skills.map((skill) => (
              <button
                key={skill}
                onClick={() => removeSkill(skill)}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                {skill} <span className="text-[10px]">✕</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
              placeholder="Adicionar qualificação..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => addSkill(newSkill)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Adicionar
            </button>
          </div>
        </section>

        {/* Currículo */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Currículo</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-900">resume.pdf</p>
                <p className="text-xs text-gray-500">Enviado em 15/07/2026</p>
              </div>
            </div>
            <label className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              Reenviar
              <input type="file" accept=".pdf,.docx" className="hidden" />
            </label>
          </div>
        </section>

        {/* Salvar */}
        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Perfil salvo com sucesso!
            </span>
          )}
          {!saved && <span />}
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}
