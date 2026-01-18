export default function MusicPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold">Listen — Music</h1>
        <p className="mt-4 text-slate-700 dark:text-slate-300">This page is a placeholder where you can add your music tracks, playlists, or embedded players.</p>

        <section className="mt-6 space-y-4">
          <div className="p-4 bg-[var(--surface-muted)] dark:bg-slate-800 rounded shadow-card">
            <h2 className="text-lg font-medium">How to add music</h2>
            <ol className="mt-2 list-decimal list-inside text-sm text-slate-700 dark:text-slate-300">
              <li>Upload tracks to a hosting service (SoundCloud, Bandcamp, Spotify, or host MP3s in a public bucket).</li>
              <li>Embed the player iframe or use an audio tag. Example embed below:</li>
            </ol>

            <div className="mt-4">
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded">
                <p className="text-xs text-slate-500">Example (replace with your embed):</p>
                <div className="mt-2">
                  {/* Example iframe placeholder - replace src with your embed URL */}
                  <div className="w-full h-24 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center text-sm text-slate-500">Embedded player appears here</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--surface-muted)] dark:bg-slate-800 rounded shadow-card">
            <h3 className="text-md font-medium">Quick embed examples</h3>
            <pre className="mt-2 p-2 bg-white/60 dark:bg-black/40 rounded text-xs overflow-auto">{`<!-- SoundCloud iframe example -->\n<iframe width="100%" height="166" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=YOUR_TRACK_URL"></iframe>`}</pre>
          </div>
        </section>
      </div>
    </main>
  )
}
