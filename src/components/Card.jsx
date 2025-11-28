import React, { useState, useEffect, useRef } from 'react'
import '../css/button.css'

const Card = ({ info, onNext }) => {
  const [isRevealed, setRevealed] = useState(false)

  // Reset revealed state when info changes
  useEffect(() => {
    setRevealed(false);
  }, [info]);

  if (!info) return <div className="text-center">Немає даних</div>;

  const handleLevelClick = (level) => {
    onNext(level)
  }

  // Хелпер для обробки посилань
  const getVideoConfig = (url) => {
    if (!url) return null;

    // Google Drive - використовуємо iframe
    if (url.includes('drive.google.com')) {
      // Перетворюємо /view або /uc на /preview
      let previewUrl = url;
      if (url.includes('/view')) {
        previewUrl = url.replace('/view', '/preview');
      } else if (url.includes('/uc?')) {
        const match = url.match(/id=([^&]+)/);
        if (match) {
          previewUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
        }
      }
      // Додаємо autoplay=1 (спроба для iframe)
      return { type: 'iframe', src: `${previewUrl}?autoplay=1` };
    }

    // Dropbox - використовуємо video tag (прямий потік)
    if (url.includes('dropbox.com')) {
      return { type: 'video', src: url.replace('dl=0', 'raw=1') };
    }

    // Інші прямі посилання
    return { type: 'video', src: url };
  }

  const videoConfig = getVideoConfig(info.videoLink)

  const videoRef = useRef(null);

  // Reload video when source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoConfig?.src]);

  const handleReveal = () => {
    // 1. Try to play FIRST (while we have the user click token)
    if (videoRef.current) {
      // Must stay muted for reliable autoplay on mobile
      videoRef.current.muted = true;
      videoRef.current.play()
        .then(() => {
          // Play started successfully
          console.log("Playback started");
        })
        .catch(err => console.log("Play error:", err));
    }

    // 2. Then reveal the video (make it visible)
    setRevealed(true);
  }

  return (
    <div className="text-center w-full mx-auto">
      {/* Word Title - shown when video is revealed */}
      {isRevealed && (
        <h2 className="text-3xl font-bold text-gray-800 mb-6">{info.wordName}</h2>
      )}

      {/* Container adapts to content */}
      <div className="relative w-full flex items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-h-[300px] transition-all duration-300 hover:shadow-xl">

        {/* Cover Layer - Absolute to overlay video or take space if video hidden */}
        {!isRevealed && (
          <div
            onClick={handleReveal}
            className="absolute inset-0 z-10 cursor-pointer flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors group"
          >

            <p className="text-3xl font-bold text-gray-800 mb-6 group-hover:text-blue-600 transition-colors">{info.wordName}</p>
            {info.pictLink && (

              <img src={info.pictLink} alt={info.wordName} className="max-h-48 mx-auto object-contain" />
            )}
            <div>

            </div>
            <div className="mt-6 flex items-center text-blue-500 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Натисніть, щоб переглянути відео
            </div>
          </div>
        )}

        {/* Video Layer */}
        <div className={`flex justify-center w-full bg-black ${!isRevealed ? 'opacity-0 pointer-events-none' : ''}`}>
          {videoConfig ? (
            videoConfig.type === 'iframe' ? (
              isRevealed && (
                <div className="w-full aspect-video">
                  <iframe
                    src={videoConfig.src}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Video player"
                  />
                </div>
              )
            ) : (
              <video
                ref={videoRef}
                src={videoConfig.src}
                controls
                playsInline
                className="max-w-full max-h-[70vh] w-auto h-auto shadow-sm"
              />
            )
          ) : (
            <div className="p-10 text-white"><p>Відео недоступне</p></div>
          )}
        </div>
      </div>

      {isRevealed && (
        <div className="mt-8 flex gap-4 justify-center">
          <button onClick={() => handleLevelClick('знаю')} className="px-6 py-3 rounded-full font-semibold text-white bg-green-500 hover:bg-green-600 shadow-md transform hover:scale-105 transition-all">Знаю</button>
          <button onClick={() => handleLevelClick('плутаюсь')} className="px-6 py-3 rounded-full font-semibold text-white bg-yellow-500 hover:bg-yellow-600 shadow-md transform hover:scale-105 transition-all">Плутаюсь</button>
          <button onClick={() => handleLevelClick('не знаю')} className="px-6 py-3 rounded-full font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md transform hover:scale-105 transition-all">Не знаю</button>
        </div>
      )}
    </div>
  )
}

export default Card
