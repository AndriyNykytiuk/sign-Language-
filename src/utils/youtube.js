// YouTube video IDs are always 11 chars of [A-Za-z0-9_-]
const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be']

export const isYouTubeUrl = (url) => {
  try {
    return YOUTUBE_HOSTS.includes(new URL(url).hostname)
  } catch {
    return false
  }
}

// Supports watch?v=, youtu.be/, shorts/, embed/, live/ and v/ links
export const getYouTubeId = (url) => {
  if (!isYouTubeUrl(url)) return null
  const parsed = new URL(url)

  let id = null
  if (parsed.hostname === 'youtu.be') {
    id = parsed.pathname.split('/')[1]
  } else if (parsed.searchParams.has('v')) {
    id = parsed.searchParams.get('v')
  } else {
    const [, kind, value] = parsed.pathname.split('/')
    if (['shorts', 'embed', 'live', 'v'].includes(kind)) id = value
  }

  return id && ID_PATTERN.test(id) ? id : null
}

export const isYouTubeShort = (url) => isYouTubeUrl(url) && new URL(url).pathname.startsWith('/shorts/')

export const getYouTubeEmbedUrl = (id) => {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1', // browsers only allow autoplay for muted videos
    playsinline: '1',
    rel: '0',
    loop: '1',
    playlist: id, // required for loop to work on a single video
    modestbranding: '1',
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}

// Error text for an invalid video link, or null when the link is acceptable
export const getVideoLinkError = (link) => {
  if (isYouTubeUrl(link) && !getYouTubeId(link)) {
    return 'Не вдалося розпізнати посилання YouTube. Скопіюйте посилання на конкретне відео.'
  }
  return null
}
