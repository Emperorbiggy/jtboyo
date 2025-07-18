import { useState } from 'react'
import Checkbox from '@/Components/Checkbox'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import PrimaryButton from '@/Components/PrimaryButton'
import TextInput from '@/Components/TextInput'
import { Head, Link, useForm } from '@inertiajs/react'

export default function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  })

  const [showPassword, setShowPassword] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    post(route('login'), {
      onFinish: () => reset('password'),
    })
  }

  return (
    <>
      <Head title="Login | Joint Tax Board" />

      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
        style={{
          backgroundImage: "url('/images/login.jpeg')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#0E7F1B]/70 backdrop-brightness-45"></div>

        {/* Login Box */}
        <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 rounded-xl shadow-lg border-t-4 border-[#0E7F1B]">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#0E7F1B]">Oyo State Joint Tax Board</h1>
            <p className="text-sm text-gray-600">Login to your dashboard</p>
          </div>

          {status && (
            <div className="mb-4 text-sm font-medium text-green-600 bg-green-100 p-2 rounded">
              {status}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div>
              <InputLabel htmlFor="email" value="Email Address" />
              <TextInput
                id="email"
                type="email"
                name="email"
                value={data.email}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-[#0E7F1B] focus:ring-[#0E7F1B]"
                autoComplete="username"
                isFocused={true}
                onChange={(e) => setData('email', e.target.value)}
              />
              <InputError message={errors.email} className="mt-2" />
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <InputLabel htmlFor="password" value="Password" />
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={data.password}
                  className="mt-1 block w-full pr-10 rounded-md border-gray-300 focus:border-[#0E7F1B] focus:ring-[#0E7F1B]"
                  autoComplete="current-password"
                  onChange={(e) => setData('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0E7F1B]"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye Off
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.08.173-2.118.492-3.092M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
                    </svg>
                  ) : (
                    // Eye On
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.269 2.943 9.542 7-1.273 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <InputError message={errors.password} className="mt-2" />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <Checkbox
                  name="remember"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>

              {canResetPassword && (
                <Link
                  href={route('password.request')}
                  className="text-sm text-[#0E7F1B] hover:underline"
                >
                  Forgot Password?
                </Link>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <PrimaryButton
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-[#0E7F1B] px-5 py-2.5 text-white font-semibold shadow-sm hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E7F1B] transition duration-200"
              >
                {processing ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 1010 10h-2A8 8 0 014 12z"
                    ></path>
                  </svg>
                ) : (
                  'Log in'
                )}
              </PrimaryButton>
            </div>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
            <Link
              href={route('register')}
              className="inline-flex items-center justify-center gap-2 w-full border border-[#0E7F1B] text-[#0E7F1B] hover:bg-[#0E7F1B] hover:text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A10 10 0 0112 15a10 10 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
