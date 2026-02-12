export async function getListenerCount() {
  try {
    const response = await fetch("https://streamer.kuci.org/status-json.xsl")
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const result = await response.json()
    return Number(result.icestats.source[0].listeners)
  } catch (error) {
    const e = error as Error
    console.error(e.message)
  }
}