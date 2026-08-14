"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SkillTag } from "@/components/SkillTag"

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

  // Step 1: Dados básicos
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")

  // Step 2: Preferências
  const [salaryMin, setSalaryMin] = useState("")
  const [workModels, setWorkModels] = useState<string[]>([])

  // Step 3: Upload CV
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)

  // Step 4: Skills
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
      // Simular parsing
      setParsing(true)
      setTimeout(() => {
        setParsing(false)
        // Mock: skills extraídas do CV
        setSkills(["Java", "Spring Boot", "SQL", "Docker", "Git", "Angular", "TypeScript"])
        setStep(4)
      }, 2000)
    }
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                s <= step ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Dados básicos */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Dados básicos</h2>
                <p className="text-gray-500 mt-1">Conte-nos um pouco sobre você</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(27) 99786-7470"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Vila Velha, ES"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Preferências */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Preferências</h2>
                <p className="text-gray-500 mt-1">O que você busca?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pretensão salarial mínima (R$)
                </label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="8000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Modelo de trabalho
                </label>
                <div className="flex gap-3">
                  {["remoto", "hibrido", "presencial"].map((model) => (
                    <button
                      key={model}
                      onClick={() => toggleWorkModel(model)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
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

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload CV */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Seu currículo</h2>
                <p className="text-gray-500 mt-1">Envie seu CV para extrairmos suas qualificações</p>
              </div>

              {parsing ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Analisando seu currículo...</p>
                  <p className="text-sm text-gray-400 mt-1">Extraindo qualificações</p>
                </div>
              ) : (
                <>
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <div className="text-4xl mb-3">📄</div>
                      <p className="font-medium text-gray-700">
                        {cvFile ? cvFile.name : "Clique para enviar"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">PDF ou DOCX (máx. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleCvUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => {
                        // Pular upload — usar skills manuais
                        setStep(4)
                      }}
                      className="flex-1 text-blue-600 hover:text-blue-700 font-medium py-2.5 rounded-xl transition-colors"
                    >
                      Pular, adicionar manualmente
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Confirmar skills */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Suas qualificações</h2>
                <p className="text-gray-500 mt-1">Confirme ou edite suas skills</p>
              </div>

              {/* Skills atuais */}
              <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border border-gray-200 rounded-xl bg-gray-50">
                {skills.length === 0 && (
                  <span className="text-sm text-gray-400">Nenhuma skill adicionada</span>
                )}
                {skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => removeSkill(skill)}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    {skill} <span className="text-[10px]">✕</span>
                  </button>
                ))}
              </div>

              {/* Adicionar skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
                  placeholder="Adicionar skill..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={() => addSkill(newSkill)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Adicionar
                </button>
              </div>

              {/* Sugestões */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Sugestões:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.filter((s) => !skills.includes(s))
                    .slice(0, 12)
                    .map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={skills.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                Concluir e ver vagas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
