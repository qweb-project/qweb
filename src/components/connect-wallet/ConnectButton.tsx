import { useEffect, useMemo, useRef, useState } from 'react'
import { useSignInWithEmail, useVerifyEmailOTP } from '@coinbase/cdp-hooks'
import { Button } from '@/components/Button'
import { Input } from '@/components/ui/input'

interface ConnectProps {
  className?: string
}

type FlowStep = 'idle' | 'email' | 'otp'

export function ConnectButton({ className }: ConnectProps) {
  const { signInWithEmail } = useSignInWithEmail()
  const { verifyEmailOTP } = useVerifyEmailOTP()

  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<FlowStep>('idle')
  const [email, setEmail] = useState('')
  const [flowId, setFlowId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const otpLength = 6
  const [otpValues, setOtpValues] = useState<string[]>(Array(otpLength).fill(''))
  const inputRefs = useRef<Array<HTMLInputElement | null>>(new Array(otpLength).fill(null))

  const otp = useMemo(() => otpValues.join(''), [otpValues])
  const canVerify = flowId && otp.length === otpLength && /\d{6}/.test(otp)

  useEffect(() => {
    if (!isOpen) {
      setStep('idle')
      setEmail('')
      setFlowId(null)
      setOtpValues(Array(otpLength).fill(''))
      setErrorMessage(null)
    }
  }, [isOpen])

  const openModal = () => {
    setIsOpen(true)
    setStep('email')
  }

  const handleSendCode = async () => {
    setErrorMessage(null)
    try {
      const result = await signInWithEmail({ email })
      setFlowId(result.flowId)
      setStep('otp')
      setTimeout(() => inputRefs.current[0]?.focus(), 0)
    } catch (error) {
      setErrorMessage('Failed to send code. Please try again.')
    }
  }

  const handleVerify = async () => {
    if (!flowId || !canVerify) return
    setErrorMessage(null)
    try {
      await verifyEmailOTP({ flowId, otp })
      setIsOpen(false)
    } catch (error) {
      setErrorMessage('Invalid code. Please try again.')
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1)
    const next = [...otpValues]
    next[index] = digit
    setOtpValues(next)
    if (digit && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < otpLength - 1) inputRefs.current[index + 1]?.focus()
  }

  return (
    <div className={className}>
      <Button variant="outline" radius="xl" size="sm" onClick={openModal}>
        Connect
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
            <div className="w-full max-w-sm rounded-xl border border-blue-500 min-h-[40vh] bg-black p-6 shadow-xl flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center gap-1">
                <img src="/logo.png" alt="connect-wallet" className="mx-auto h-14 w-14 mb-4" />
                <h2 className="text-lg font-medium">Sign in</h2>
              </div>
              {step === 'email' && (
                <div className="space-y-3 w-full text-center mt-6">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="doraemon@connect.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      className="max-w-xs mx-auto h-14"
                    />
                  </div>
                  {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      radius="xl"
                      onClick={handleSendCode}
                      disabled={!email}
                      className="w-full h-14 bg-blue-500 hover:bg-blue-600"
                    >
                      Send code
                    </Button>
                  </div>
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-4 w-full text-center">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Enter the 6‑digit code</h3>
                    <p className="text-xs text-muted-foreground">We sent a code to {email}</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: otpLength }).map((_, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className="w-10 h-12 text-center text-lg rounded-md border border-border bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        value={otpValues[idx]}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      />
                    ))}
                  </div>
                  {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
                  <div className="flex gap-2 justify-center">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" radius="xl" onClick={handleSendCode}>
                        Resend
                      </Button>
                      <Button size="sm" radius="xl" onClick={handleVerify} disabled={!canVerify} className="bg-blue-500 hover:bg-blue-600">
                        Verify
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 w-full border-t border-blue-500 pt-3 text-center text-xs text-muted-foreground">
                Made with <span className="text-primary">♡</span> by Qweb
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


