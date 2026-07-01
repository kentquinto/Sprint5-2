import { inputCls, labelCls } from '../utils/formStyles'

export default function EventForm({ form, setForm, games, editingId, formError, formLoading, onSubmit, onCancel }) {
  return (
    <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-6 mb-8 shadow-sm">
      <h2 className="text-lg font-bold text-[#0F172A] mb-6">
        {editingId ? 'Edit Event' : 'Create an Event'}
      </h2>

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {formError}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        onKeyDown={e => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault() }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Event Title</label>
            <input type="text" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required placeholder="e.g. Local tournament" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Game</label>
            <select value={form.game_id}
              onChange={e => setForm({ ...form, game_id: e.target.value })}
              required className={inputCls}>
              <option value="">Select a game</option>
              {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3} placeholder="Describe your event..." className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Location</label>
          <input type="text" value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            required placeholder="e.g. Barcelona Game Store" className={inputCls} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Date & Time</label>
            <input type="datetime-local" value={form.date_time}
              onChange={e => setForm({ ...form, date_time: e.target.value })}
              required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Max Players</label>
            <input type="number" value={form.max_players}
              onChange={e => setForm({ ...form, max_players: Number(e.target.value) })}
              required min={2} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Entry Fee (€)</label>
            <input type="number" value={form.entry_fee}
              onChange={e => setForm({ ...form, entry_fee: Number(e.target.value) })}
              required min={0} step="0.01" className={inputCls} />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={formLoading}
            className="bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer">
            {formLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
          </button>
          <button type="button" onClick={onCancel}
            className="border border-white/60 bg-white/50 text-[#334155] hover:bg-white/70 px-5 py-2 rounded-full text-sm transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
