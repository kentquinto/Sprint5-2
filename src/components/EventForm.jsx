import Button from './ui/Button'
import Card from './ui/Card'
import Field from './ui/Field'

export default function EventForm({ form, setForm, games, editingId, formError, fieldErrors, formLoading, onSubmit, onCancel }) {
  return (
    <Card className="p-6 mb-8">
      <h2 className="text-lg font-bold text-ink mb-6">
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
          <Field label="Event Title" name="title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required placeholder="e.g. Local tournament" errors={fieldErrors} />
          <Field label="Game" name="game_id" as="select" value={form.game_id}
            onChange={e => setForm({ ...form, game_id: e.target.value })}
            required errors={fieldErrors}>
            <option value="">Select a game</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Field>
        </div>

        <Field label="Description" name="description" as="textarea" value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={3} placeholder="Describe your event..." errors={fieldErrors} />

        <Field label="Location" name="location" value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
          required placeholder="e.g. Barcelona Game Store" errors={fieldErrors} />

        <div className="grid grid-cols-3 gap-4">
          <Field label="Date & Time" name="date_time" type="datetime-local" value={form.date_time}
            onChange={e => setForm({ ...form, date_time: e.target.value })}
            required errors={fieldErrors} />
          <Field label="Max Players" name="max_players" type="number" value={form.max_players}
            onChange={e => setForm({ ...form, max_players: Number(e.target.value) })}
            required min={2} errors={fieldErrors} />
          <Field label="Entry Fee (€)" name="entry_fee" type="number" value={form.entry_fee}
            onChange={e => setForm({ ...form, entry_fee: Number(e.target.value) })}
            required min={0} step="0.01" errors={fieldErrors} />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={formLoading}>
            {formLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="font-normal">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
