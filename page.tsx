'use client'

import { useRef, useState, useEffect } from 'react'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [diagnosis, setDiagnosis] = useState<string>('')

  // カメラ起動
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    })
  }, [])

  // 写真を撮る＆診断を表示
  const handleTakePhoto = () => {
    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas || !video) return

    const context = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context?.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height)
    if (!imageData) return

    const avg = getAverageBrightness(imageData)
    const result = getDiagnosis(avg)
    setDiagnosis(result)
  }

  // 明るさの平均を計算
  const getAverageBrightness = (imageData: ImageData): number => {
    const data = imageData.data
    let total = 0
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (r + g + b) / 3
      total += brightness
    }
    return total / (data.length / 4)
  }

  // 仮の診断ロジック
  const getDiagnosis = (brightness: number): string => {
    if (brightness > 150) {
      return 'あなたは明るく前向きな性格です。人とのコミュニケーションが得意でしょう。'
    } else {
      return 'あなたは落ち着いていて、物事をじっくり考えるタイプです。'
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <video ref={videoRef} autoPlay className="rounded-lg shadow-lg w-full max-w-md" />
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={handleTakePhoto}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        診断スタート
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

<div className="relative w-full max-w-md">
  <video ref={videoRef} autoPlay className="rounded-lg shadow-lg w-full" />
  <img
    src="/hand-guide.png"
    alt="手のガイド"
    className="absolute top-0 left-0 w-full opacity-40 pointer-events-none"
  />
</div>

