"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const SUGGESTED_SKILLS = [
  "Java", "Spring Boot", "Python", "JavaScript", "TypeScript",
  "React", "Angular", "Vue", "Node.js", "Go",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  "SQL", "PostgreSQL", "MongoDB", "Redis", "Kafka",
  "Git", "CI/CD", "REST", "GraphQL", "Flutter",
]

type Step = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [salaryMin, setSalaryMin] = useState("")
  const [workModels, setWorkModels] = useState<string[]>([])
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")

  const toggleWorkModel = (model: string) => {
    setWorkModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
    }
    setNewSkill("")
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCvFile(file)
      setParsing(true)
      setTimeout(() => {
        setParsing(false)
        setSkills(["Java", "Spring Boot", "SQL", "Docker", "Git", "Angular", "TypeScript"])
        setStep(4)
      }, 2000)
    }
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed top-1/3 left-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 w-14 rounded-full transition-all duration-300 ${
                s <= step ? "bg-accent" : "bg-surface-300"
              }`}
            />
          ))}
        </div>

        <div className="glass-card p-10">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Dados básicos</h2>
                <p className="text-surface-800 mt-1">Conte-nos sobre você</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Nome completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Telefone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(27) 99786-7470" className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Localização</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Vila Velha, ES" className="input-dark" />
              </div>

              <button onClick={() => setStep(2)} className="btn-primary w-full">Continuar</button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Preferências</h2>
                <p className="text-surface-800 mt-1">O que você busca?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-800 mb-2">Pretensão salarial (R$)</label>
                <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="8000" className="input-dark" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-800 mb-3">Modelo de trabalho</label>
                <div className="flex gap-3">
                  {["remoto", "hibrido", "presencial"].map((model) => (
                    <button
                      key={model}
                      onClick={() => toggleWorkModel(model)}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
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

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Voltar</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Continuar</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Currículo</h2>
                <p className="text-surface-800 mt-1">Envie seu CV para extrairmos suas qualificações</p>
              </div>

              {parsing ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white font-medium">Analisando currículo...</p>
                  <p className="text-sm text-surface-700 mt-1">Extraindo qualificações</p>
                </div>
              ) : (
                <>
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-dark-border rounded-2xl p-14 text-center hover:border-accent/40 hover:bg-accent-glow transition-all duration-300">
                      <div className="text-4xl mb-3 opacity-60">📄</div>
                      <p className="font-medium text-surface-900">
                        {cvFile ? cvFile.name : "Clique para enviar"}
                      </p>
                      <p className="text-sm text-surface-700 mt-1">PDF ou DOCX (máx. 10MB)</p>
                    </div>
                    <input type="file" accept=".pdf,.docx" onChange={handleCvUpload} className="hidden" />
                  </label>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(2)} className="btn-secondary flex-1">Voltar</button>
                    <button onClick={() => setStep(4)} className="text-accent hover:text-accent-light font-medium flex-1 py-3 transition-colors">
                      Pular
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Qualificações</h2>
                <p className="text-surface-800 mt-1">Confirme ou edite suas skills</p>
              </div>

              {/* Current skills */}
              <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-surface-100 border border-dark-border rounded-xl">
                {skills.length === 0 && <span className="text-sm text-surface-700">Nenhuma skill</span>}
                {skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => removeSkill(skill)}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-accent-glow text-accent border border-accent/20 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20 transition-all"
                  >
                    {skill} <span className="text-[10px] opacity-60">✕</span>
                  </button>
                ))}
              </div>

              {/* Add skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
                  placeholder="Adicionar skill..."
                  className="input-dark flex-1"
                />
                <button onClick={() => addSkill(newSkill)} className="btn-secondary px-4">+</button>
              </div>

              {/* Suggestions */}
              <div>
                <p className="text-xs text-surface-700 mb-2">Sugestões:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).slice(0, 10).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="text-xs px-2.5 py-1 rounded-full border border-dark-border text-surface-700 hover:border-accent/40 hover:text-accent hover:bg-accent-glow transition-all"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={skills.length === 0}
                className="btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
