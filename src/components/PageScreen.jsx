export default function PageScreen({ message }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100 flex items-center justify-center">
      <p className="text-white/80 text-sm">{message}</p>
    </div>
  )
}
