"use client"

import { useState, useEffect } from "react"
import { useProfile } from "@/hooks/useProfile"

export default function ProfilePage() {
  const { profile, loading, updateProfile, updateSkills, uploadResume } = useProfile()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [salaryMin, setSalaryMin] = useState(0)
  const [experienceYears, setExperienceYears] = useState(0)
  const [workModels, setWorkModels] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [saved, setSaved] = useState(false)

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setPhone(profile.phone || "")
      setLocation(profile.location || "")
      setSalaryMin(profile.salaryMin || 0)
      setExperienceYears(profile.experienceYears || 0)
      setWorkModels(profile.workModels || [])
      setSkills(profile.skills || [])
    }
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const toggleWorkModel = (model: string) => {
    setWorkModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()])
    }
    setNewSkill("")
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSave = async () => {
    await updateProfile({
      name,
      phone,
      location,
      salaryMin,
      experienceYears,
      workModels,
      skills,
    } as any)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const extractedSkills = await uploadResume(file)
      if (extractedSkills.length > 0) {
        const merged = [...new Set([...skills, ...extractedSkills])]
        setSkills(merged)
      }
    }
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anos de experiência
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
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
                  onClick={() => toggleWorkModel(model)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    workModels.includes(model)
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
            {skills.map((skill) => (
              <button
                key={skill}
                onClick={() => removeSkill(skill)}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                {skill} <span className="text-[10px]">✕</span>
              </button>
            ))}
            {skills.length === 0 && (
              <span className="text-sm text-gray-400">Nenhuma qualificação adicionada</span>
            )}
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
                <p className="text-sm font-medium text-gray-900">
                  {profile?.resumePath ? "CV enviado" : "Nenhum CV enviado"}
                </p>
                <p className="text-xs text-gray-500">PDF ou DOCX (máx. 10MB)</p>
              </div>
            </div>
            <label className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              {profile?.resumePath ? "Reenviar" : "Enviar"}
              <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
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
