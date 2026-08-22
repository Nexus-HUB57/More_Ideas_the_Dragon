import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Code, Lightbulb, Bug, RefreshCw, Languages, Loader2 } from 'lucide-react'
import './App.css'

function App() {
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const [language, setLanguage] = useState('Python')
  const [fromLanguage, setFromLanguage] = useState('Python')
  const [toLanguage, setToLanguage] = useState('JavaScript')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('generate')

  const languages = ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'TypeScript', 'PHP', 'Ruby']

  const handleGenerateCode = async () => {
    if (!inputCode.trim()) {
      alert('Por favor, insira uma descrição para gerar o código.')
      return
    }

    setLoading(true)
    setOutputCode('')

    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputCode,
          language: language,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOutputCode(data.code)
      } else {
        setOutputCode(`Erro: ${data.error}`)
      }
    } catch (error) {
      setOutputCode(`Erro ao gerar código: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleExplainCode = async () => {
    if (!inputCode.trim()) {
      alert('Por favor, insira um código para explicar.')
      return
    }

    setLoading(true)
    setOutputCode('')

    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: inputCode,
          language: language,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOutputCode(data.explanation)
      } else {
        setOutputCode(`Erro: ${data.error}`)
      }
    } catch (error) {
      setOutputCode(`Erro ao explicar código: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDebugCode = async () => {
    if (!inputCode.trim()) {
      alert('Por favor, insira um código para depurar.')
      return
    }

    setLoading(true)
    setOutputCode('')

    try {
      const response = await fetch('/api/debug-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: inputCode,
          error: errorMessage,
          language: language,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOutputCode(data.debug_result)
      } else {
        setOutputCode(`Erro: ${data.error}`)
      }
    } catch (error) {
      setOutputCode(`Erro ao depurar código: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRefactorCode = async () => {
    if (!inputCode.trim()) {
      alert('Por favor, insira um código para refatorar.')
      return
    }

    setLoading(true)
    setOutputCode('')

    try {
      const response = await fetch('/api/refactor-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: inputCode,
          language: language,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOutputCode(data.refactored_result)
      } else {
        setOutputCode(`Erro: ${data.error}`)
      }
    } catch (error) {
      setOutputCode(`Erro ao refatorar código: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTranslateCode = async () => {
    if (!inputCode.trim()) {
      alert('Por favor, insira um código para traduzir.')
      return
    }

    setLoading(true)
    setOutputCode('')

    try {
      const response = await fetch('/api/translate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: inputCode,
          from_language: fromLanguage,
          to_language: toLanguage,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOutputCode(data.translated_code)
      } else {
        setOutputCode(`Erro: ${data.error}`)
      }
    } catch (error) {
      setOutputCode(`Erro ao traduzir código: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
            Assistente de Codificação
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Powered by Llama 4 Maverick
          </p>
        </header>

        <Card className="shadow-xl animate-slide-in-up">
          <CardHeader>
            <CardTitle>Escolha uma Operação</CardTitle>
            <CardDescription>
              Use o poder do Llama 4 Maverick para gerar, explicar, depurar, refatorar ou traduzir código
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span className="hidden sm:inline">Gerar</span>
                </TabsTrigger>
                <TabsTrigger value="explain" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Explicar</span>
                </TabsTrigger>
                <TabsTrigger value="debug" className="flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  <span className="hidden sm:inline">Depurar</span>
                </TabsTrigger>
                <TabsTrigger value="refactor" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refatorar</span>
                </TabsTrigger>
                <TabsTrigger value="translate" className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <span className="hidden sm:inline">Traduzir</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Linguagem de Programação</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma linguagem" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição do que o código deve fazer</label>
                  <Textarea
                    placeholder="Ex: Crie uma função que calcule o fatorial de um número"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    rows={6}
                    className="font-mono"
                  />
                </div>
                <Button onClick={handleGenerateCode} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Code className="mr-2 h-4 w-4" />
                      Gerar Código
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="explain" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Linguagem de Programação</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma linguagem" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código para explicar</label>
                  <Textarea
                    placeholder="Cole o código aqui..."
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    rows={6}
                    className="font-mono"
                  />
                </div>
                <Button onClick={handleExplainCode} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Explicando...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Explicar Código
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="debug" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Linguagem de Programação</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma linguagem" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código com problema</label>
                  <Textarea
                    placeholder="Cole o código aqui..."
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    rows={6}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensagem de erro (opcional)</label>
                  <Textarea
                    placeholder="Cole a mensagem de erro aqui..."
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    rows={3}
                    className="font-mono"
                  />
                </div>
                <Button onClick={handleDebugCode} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Depurando...
                    </>
                  ) : (
                    <>
                      <Bug className="mr-2 h-4 w-4" />
                      Depurar Código
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="refactor" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Linguagem de Programação</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma linguagem" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código para refatorar</label>
                  <Textarea
                    placeholder="Cole o código aqui..."
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    rows={6}
                    className="font-mono"
                  />
                </div>
                <Button onClick={handleRefactorCode} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refatorando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refatorar Código
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="translate" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">De</label>
                    <Select value={fromLanguage} onValueChange={setFromLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Linguagem origem" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Para</label>
                    <Select value={toLanguage} onValueChange={setToLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Linguagem destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código para traduzir</label>
                  <Textarea
                    placeholder="Cole o código aqui..."
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    rows={6}
                    className="font-mono"
                  />
                </div>
                <Button onClick={handleTranslateCode} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traduzindo...
                    </>
                  ) : (
                    <>
                      <Languages className="mr-2 h-4 w-4" />
                      Traduzir Código
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {outputCode && (
              <div className="mt-6 space-y-2 animate-fade-in">
                <label className="text-sm font-medium">Resultado</label>
                <Textarea
                  value={outputCode}
                  readOnly
                  rows={12}
                  className="font-mono bg-slate-50 dark:bg-slate-900"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
          <p>Desenvolvido com Llama 4 Maverick - Um modelo multimodal de IA da Meta</p>
        </footer>
      </div>
    </div>
  )
}

export default App
