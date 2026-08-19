import React, { useRef, useState } from 'react'
import { FaCamera, FaTrash } from 'react-icons/fa'
import { Label, Hint } from './Form'

const MAX_EDGE = 600 // px — passport photos need no more than this
const QUALITY = 0.85
const MAX_SOURCE_MB = 8

/**
 * Passport photo upload that hands the API a base64 string.
 *
 * Phone cameras produce 3–8MB images, and base64 inflates by a further ~33%,
 * which would blow past post_max_size long before it reached JRB. So the file
 * is drawn to a canvas, capped at 600px on its longest edge and re-encoded as
 * JPEG before being converted — a passport photo needs nothing more.
 *
 * `value` is the bare base64 payload with no data: prefix; the prefix is kept
 * only in local state for the preview.
 */
export default function PhotoField({ name, label, value, onChange, required, hint }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleFile = (file) => {
    if (!file) return

    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.')
      return
    }

    if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
      setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Use one under ${MAX_SOURCE_MB}MB.`)
      return
    }

    setBusy(true)
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)

        const context = canvas.getContext('2d')
        // JPEG has no alpha channel; without this, transparent PNGs go black.
        context.fillStyle = '#fff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/jpeg', QUALITY)
        setPreview(dataUrl)
        onChange(name, dataUrl.split(',')[1])
        setBusy(false)
      }

      image.onerror = () => {
        setError('That image could not be read.')
        setBusy(false)
      }

      image.src = reader.result
    }

    reader.onerror = () => {
      setError('That file could not be read.')
      setBusy(false)
    }

    reader.readAsDataURL(file)
  }

  const clear = () => {
    setPreview(null)
    setError(null)
    onChange(name, '')
    if (inputRef.current) inputRef.current.value = ''
  }

  const sizeKb = value ? Math.round((value.length * 3) / 4 / 1024) : 0

  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>

      <input
        ref={inputRef}
        id={name}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {preview ? (
        <div className="flex items-start gap-3 rounded-md border border-gray-300 p-2">
          <img src={preview} alt="Passport preview" className="h-24 w-20 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-600">Uploaded · ~{sizeKb}KB</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                <FaTrash /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-6 text-sm text-gray-600 transition hover:border-[#0E7F1B] hover:bg-green-50 disabled:opacity-60"
        >
          <FaCamera className="text-lg text-[#0E7F1B]" />
          {busy ? 'Processing…' : 'Upload passport photo'}
        </button>
      )}

      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : <Hint>{hint}</Hint>}
    </div>
  )
}
