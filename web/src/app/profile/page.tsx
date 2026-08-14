"use client"

import { useState, useEffect } from "react"
import { useProfile } from "@/hooks/useProfile"

export default function ProfilePage() {
  const { profile, loading, updateProfile, uploadResume } = useProfile()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [salaryMin, setSalaryMin] = useState(0)
  const [experienceYears, setExperienceYears] = useState(0)
  const [workModels, setWorkModels] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [saved, setSaved] = useState(false)

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
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const toggleWorkModel = (model: string) => {
    setWorkModels((prev) => prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model])
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) setSkills([...skills, skill.trim()])
    setNewSkill("")
  }

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill))

  const handleSave = async () => {
    await updateProfile({ name, phone, location, salaryMin, experienceYears, workModels, skills } as any)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Perfil<span className="text-accent">.</span></h1>
          <p className="text-surface-800 mt-1">Gerencie suas informações e qualificações</p>
        </div>

        <div className="space-y-6">
          {/* Dados pessoais */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Dados pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Nome</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Email</label>
                <input type="email" value={profile?.email || ""} disabled className="input-dark opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Telefone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Localização</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-dark" />
              </div>
            </div>
          </section>

          {/* Preferências */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Preferências</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Salário mínimo (R$)</label>
                <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(Number(e.target.value))} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Anos de experiência</label>
                <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} className="input-dark" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-800 mb-3">Modelo de trabalho</label>
              <div className="flex gap-3">
                {["remoto", "hibrido", "presencial"].map((model) => (
                  <button
                    key={model}
                    onClick={() => toggleWorkModel(model)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      workModels.includes(model)
                        ? "bg-accent-glow border-accent/40 text-accent"
                        : "border-dark-border text-surface-800 hover:border-surface-500"
                    }`}
                  >
                    {model === "remoto" ? "Remoto" : model === "hibrido" ? "Híbrido" : "Presencial"}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Qualificações</h2>
            <div className="flex flex-wrap gap-2 min-h-[48px] mb-4">
              {skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => removeSkill(skill)}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-accent-glow text-accent border border-accent/20 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20 transition-all"
                >
                  {skill} <span className="text-[10px] opacity-60">✕</span>
                </button>
              ))}
              {skills.length === 0 && <span className="text-sm text-surface-700">Nenhuma qualificação</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
                placeholder="Adicionar qualificação..."
                className="input-dark flex-1"
              />
              <button onClick={() => addSkill(newSkill)} className="btn-secondary px-4">+</button>
            </div>
          </section>

          {/* CV */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Currículo</h2>
            <div className="flex items-center justify-between p-4 bg-surface-100 rounded-xl border border-dark-border">
              <div className="flex items-center gap-3">
                <span className="text-2xl opacity-60">📄</span>
                <div>
                  <p className="text-sm font-medium text-white">{profile?.resumePath ? "CV enviado" : "Nenhum CV"}</p>
                  <p className="text-xs text-surface-700">PDF ou DOCX</p>
                </div>
              </div>
              <label className="text-sm text-accent hover:text-accent-light font-medium cursor-pointer transition-colors">
                {profile?.resumePath ? "Reenviar" : "Enviar"}
                <input type="file" accept=".pdf,.docx" className="hidden" />
              </label>
            </div>
          </section>

          {/* Save */}
          <div className="flex items-center justify-between pt-4">
            {saved && <span className="text-sm text-green-400 font-medium">Salvo!</span>}
            {!saved && <span />}
            <button onClick={handleSave} className="btn-primary">
              Salvar alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
