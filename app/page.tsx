
'use client'

import { useRef, useState } from 'react'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)

  const handleStartCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)
    } catch (err) {
      console.error('カメラ起動エラー:', err)
    }
  }

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')!
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const brightness = getAverageBrightness(imageData)
    const result = getDiagnosis(brightness)
    setDiagnosis(result)

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const getAverageBrightness = (imageData: ImageData): number => {
    const data = imageData.data
    let total = 0
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      total += brightness
    }
    return total / (data.length / 4)
  }

  const getDiagnosis = (brightness: number): string => {
    return brightness > 150
      ? 'あなたは明るく前向きな性格です。'
      : 'あなたは落ち着いていて慎重な性格です。'
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 bg-gray-100">
      <div className="relative w-full max-w-md">
        <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg shadow-lg" />
        <img
          src="/hand-guide.png"
          alt="手のガイド"
          className="absolute top-0 left-0 w-full opacity-40 pointer-events-none"
        />
      </div>

      <canvas
        ref={canvasRef}
        className={`rounded shadow ${diagnosis ? 'block' : 'hidden'}`}
      />

      <button
        onClick={handleStartCamera}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        カメラを起動
      </button>

      <button
        onClick={handleTakePhoto}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        撮影する
      </button>

      {diagnosis && (
        <div className="bg-white text-gray-800 p-4 rounded shadow max-w-md text-center">
          <h2 className="text-lg font-bold mb-2">診断結果</h2>
          <p>{diagnosis}</p>
        </div>
      )}
    </main>
  )
}
