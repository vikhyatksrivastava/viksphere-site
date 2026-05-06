import TravelMap from '../components/TravelMap'

export const metadata = {
  title: 'My Footprints'
}

export default function TravelBoardPage() {
  return (
    <main className="container-max px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">My Footprints</h1>
        <p className="text-sm text-slate-500 mb-6">Cities I've ever visited and explored. Click a dot to know more about the city from my perspective.</p>
        <div className="rounded border p-4 bg-white">
          <TravelMap />
        </div>
      </div>
    </main>
  )
}
