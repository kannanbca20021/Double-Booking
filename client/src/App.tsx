import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Armchair,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import './App.css'

type DiningTable = { id: number; tableNumber: number; capacity: number }
type Booking = {
  id: number
  tableId: number
  customerName: string
  bookingDate: string
  startTime: string
  endTime: string
  status: 'CONFIRMED' | 'CANCELLED'
}
type ApiError = { status: number; error: string; message: string }
type Notice = { type: 'success' | 'error'; message: string }

const today = new Date().toLocaleDateString('en-CA')

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: options?.body
      ? { 'Content-Type': 'application/json', ...options.headers }
      : options?.headers,
  })
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null
    throw new Error(error?.message ?? 'The request could not be completed.')
  }
  return response.json() as Promise<T>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(`2000-01-01T${value}`))
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function App() {
  const [tables, setTables] = useState<DiningTable[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [tableModalOpen, setTableModalOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    tableId: '', customerName: '', bookingDate: today, startTime: '18:00', endTime: '19:00',
  })
  const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: '2' })

  async function loadData() {
    try {
      const [tableData, bookingData] = await Promise.all([
        apiRequest<DiningTable[]>('/api/tables'),
        apiRequest<Booking[]>('/api/bookings'),
      ])
      setTables(tableData)
      setBookings(bookingData)
      setBookingForm((current) => ({
        ...current,
        tableId: current.tableId || String(tableData[0]?.id ?? ''),
      }))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to reach the server.')
    } finally {
      setLoading(false)
    }
  }

  function refreshData() {
    setLoading(true)
    setLoadError('')
    void loadData()
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadData(), 0)
    return () => window.clearTimeout(timeout)
  }, [])
  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  async function createBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      const created = await apiRequest<Booking>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ ...bookingForm, tableId: Number(bookingForm.tableId) }),
      })
      setBookings((current) => [...current, created])
      setBookingModalOpen(false)
      setBookingForm((current) => ({ ...current, customerName: '' }))
      setNotice({ type: 'success', message: `Reservation confirmed for ${created.customerName}.` })
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Unable to create the reservation.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function createTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      const created = await apiRequest<DiningTable>('/api/tables', {
        method: 'POST',
        body: JSON.stringify({ tableNumber: Number(tableForm.tableNumber), capacity: Number(tableForm.capacity) }),
      })
      setTables((current) => [...current, created])
      setBookingForm((current) => ({ ...current, tableId: current.tableId || String(created.id) }))
      setTableModalOpen(false)
      setTableForm({ tableNumber: '', capacity: '2' })
      setNotice({ type: 'success', message: `Table ${created.tableNumber} is ready for reservations.` })
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Unable to add the table.' })
    } finally {
      setSubmitting(false)
    }
  }

  const confirmedBookings = bookings.filter((booking) => booking.status === 'CONFIRMED')
  const upcomingBookings = [...confirmedBookings]
    .filter((booking) => booking.bookingDate >= today)
    .sort((a, b) => `${a.bookingDate}${a.startTime}`.localeCompare(`${b.bookingDate}${b.startTime}`))
  const totalSeats = tables.reduce((sum, table) => sum + table.capacity, 0)
  const tableFor = (id: number) => tables.find((table) => table.id === id)
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileNavOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar--open' : ''}`}>
        <div className="brand">
          <span className="brand__mark"><UtensilsCrossed size={20} /></span>
          <div><strong>Kannan</strong><small>TABLE RESERVATIONS</small></div>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <button className="nav__item nav__item--active" onClick={() => scrollTo('overview')}><LayoutDashboard size={18} /> Overview</button>
          <button className="nav__item" onClick={() => scrollTo('bookings')}><CalendarDays size={18} /> Bookings <span>{confirmedBookings.length}</span></button>
          <button className="nav__item" onClick={() => scrollTo('tables')}><Armchair size={18} /> Tables <span>{tables.length}</span></button>
        </nav>
        <div className="sidebar__footer">
          <div className={`service-status ${loadError ? 'service-status--offline' : ''}`}><i /> {loadError ? 'Booking service unavailable' : 'Booking service online'}</div>
          <small>Double-booking protection active</small>
        </div>
      </aside>
      {mobileNavOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <main className="main" id="overview">
        <header className="topbar">
          <button className="icon-button menu-button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="topbar__title"><span>DINING ROOM / OVERVIEW</span><h1>Good evening</h1></div>
          <div className="topbar__actions">
            <button className="button button--secondary" onClick={() => setTableModalOpen(true)}><Plus size={17} /> Add table</button>
            <button className="button button--primary" onClick={() => setBookingModalOpen(true)} disabled={!tables.length}><CalendarDays size={17} /> New booking</button>
          </div>
        </header>

        <div className="content">
          {loadError && (
            <div className="connection-error" role="alert">
              <CircleAlert size={20} /><div><strong>Could not connect to the booking service</strong><span>{loadError}</span></div>
              <button className="button button--secondary" onClick={refreshData}><RefreshCw size={16} /> Retry</button>
            </div>
          )}

          <section className="welcome-band">
            <div><span className="eyebrow"><Sparkles size={14} /> SERVICE AT A GLANCE</span><h2>Your dining room,<br />beautifully organized.</h2><p>Keep every table in rhythm and every reservation conflict-free.</p></div>
            <button className="text-action" onClick={() => setBookingModalOpen(true)} disabled={!tables.length}>Create a reservation <ArrowRight size={18} /></button>
            <div className="welcome-band__pattern" aria-hidden="true" />
          </section>

          <section className="stats" aria-label="Booking summary">
            <article className="stat"><span className="stat__icon stat__icon--wine"><CalendarDays size={20} /></span><div><small>UPCOMING BOOKINGS</small><strong>{upcomingBookings.length}</strong></div><span className="stat__note">Confirmed</span></article>
            <article className="stat"><span className="stat__icon stat__icon--sage"><Armchair size={20} /></span><div><small>DINING TABLES</small><strong>{tables.length}</strong></div><span className="stat__note">Available to book</span></article>
            <article className="stat"><span className="stat__icon stat__icon--gold"><Users size={20} /></span><div><small>TOTAL CAPACITY</small><strong>{totalSeats}</strong></div><span className="stat__note">Guest seats</span></article>
          </section>

          <section className="workspace" id="bookings">
            <div className="section-heading"><div><span className="eyebrow">RESERVATION BOOK</span><h2>Upcoming bookings</h2></div><button className="icon-button" aria-label="Refresh bookings" title="Refresh bookings" onClick={refreshData}><RefreshCw size={17} className={loading ? 'spin' : ''} /></button></div>
            <div className="booking-list">
              {loading ? <div className="empty-state"><LoaderCircle className="spin" size={24} /><strong>Preparing your dining room</strong></div>
                : upcomingBookings.length === 0 ? <div className="empty-state"><span><CalendarDays size={23} /></span><strong>No upcoming reservations</strong><p>Add a table, then create your first booking.</p><button className="button button--primary" onClick={() => setBookingModalOpen(true)} disabled={!tables.length}>New booking</button></div>
                : upcomingBookings.map((booking) => {
                  const table = tableFor(booking.tableId)
                  const date = new Date(`${booking.bookingDate}T00:00:00`)
                  return <article className="booking-row" key={booking.id}>
                    <div className="booking-row__date"><strong>{date.getDate()}</strong><span>{date.toLocaleDateString('en-US', { month: 'short' })}</span></div>
                    <div className="avatar">{initials(booking.customerName)}</div>
                    <div className="booking-row__guest"><strong>{booking.customerName}</strong><span>{formatDate(booking.bookingDate)}</span></div>
                    <div className="booking-row__detail"><Clock3 size={16} /><span><small>TIME</small>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span></div>
                    <div className="booking-row__detail"><Armchair size={16} /><span><small>TABLE</small>Table {table?.tableNumber ?? booking.tableId} · {table?.capacity ?? '-'} seats</span></div>
                    <span className="status"><Check size={13} /> Confirmed</span><ChevronRight size={18} className="booking-row__chevron" />
                  </article>
                })}
            </div>
          </section>

          <section className="table-section" id="tables">
            <div className="section-heading"><div><span className="eyebrow">FLOOR INVENTORY</span><h2>Your tables</h2></div><button className="button button--secondary" onClick={() => setTableModalOpen(true)}><Plus size={16} /> Add table</button></div>
            <div className="table-grid">
              {tables.map((table) => <article className="table-card" key={table.id}>
                <div className="table-card__top"><span><Armchair size={20} /></span><i>AVAILABLE</i></div><strong>Table {table.tableNumber}</strong><p><Users size={16} /> Up to {table.capacity} guests</p>
                <button onClick={() => { setBookingForm((current) => ({ ...current, tableId: String(table.id) })); setBookingModalOpen(true) }}>Book this table <ArrowRight size={16} /></button>
              </article>)}
              {!loading && tables.length === 0 && <button className="add-table-card" onClick={() => setTableModalOpen(true)}><Plus size={22} /><span>Add your first table</span></button>}
            </div>
          </section>
        </div>
      </main>

      {bookingModalOpen && <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setBookingModalOpen(false)}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
          <div className="modal__header"><div><span className="eyebrow">NEW RESERVATION</span><h2 id="booking-title">Book a table</h2></div><button className="icon-button" aria-label="Close" onClick={() => setBookingModalOpen(false)}><X size={19} /></button></div>
          <form onSubmit={createBooking}>
            <label className="field field--wide"><span>Guest name</span><input required value={bookingForm.customerName} placeholder="e.g. Maya Chen" onChange={(event) => setBookingForm({ ...bookingForm, customerName: event.target.value })} /></label>
            <label className="field field--wide"><span>Table</span><select required value={bookingForm.tableId} onChange={(event) => setBookingForm({ ...bookingForm, tableId: event.target.value })}><option value="" disabled>Select a table</option>{tables.map((table) => <option key={table.id} value={table.id}>Table {table.tableNumber} · {table.capacity} seats</option>)}</select></label>
            <label className="field field--wide"><span>Date</span><input type="date" required min={today} value={bookingForm.bookingDate} onChange={(event) => setBookingForm({ ...bookingForm, bookingDate: event.target.value })} /></label>
            <label className="field"><span>Start time</span><input type="time" required value={bookingForm.startTime} onChange={(event) => setBookingForm({ ...bookingForm, startTime: event.target.value })} /></label>
            <label className="field"><span>End time</span><input type="time" required value={bookingForm.endTime} onChange={(event) => setBookingForm({ ...bookingForm, endTime: event.target.value })} /></label>
            <div className="form-note field--wide"><CircleAlert size={16} /> Conflicting time slots are blocked automatically.</div>
            <div className="modal__actions field--wide"><button type="button" className="button button--secondary" onClick={() => setBookingModalOpen(false)}>Cancel</button><button className="button button--primary" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />} Confirm booking</button></div>
          </form>
        </section>
      </div>}

      {tableModalOpen && <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setTableModalOpen(false)}>
        <section className="modal modal--small" role="dialog" aria-modal="true" aria-labelledby="table-title">
          <div className="modal__header"><div><span className="eyebrow">DINING ROOM</span><h2 id="table-title">Add a table</h2></div><button className="icon-button" aria-label="Close" onClick={() => setTableModalOpen(false)}><X size={19} /></button></div>
          <form onSubmit={createTable}>
            <label className="field field--wide"><span>Table number</span><input type="number" required min="1" value={tableForm.tableNumber} placeholder="e.g. 12" onChange={(event) => setTableForm({ ...tableForm, tableNumber: event.target.value })} /></label>
            <label className="field field--wide"><span>Seating capacity</span><input type="number" required min="1" value={tableForm.capacity} onChange={(event) => setTableForm({ ...tableForm, capacity: event.target.value })} /></label>
            <div className="modal__actions field--wide"><button type="button" className="button button--secondary" onClick={() => setTableModalOpen(false)}>Cancel</button><button className="button button--primary" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />} Add table</button></div>
          </form>
        </section>
      </div>}

      {notice && <div className={`toast toast--${notice.type}`} role="status">{notice.type === 'success' ? <Check size={18} /> : <CircleAlert size={18} />}<span>{notice.message}</span><button aria-label="Dismiss notification" onClick={() => setNotice(null)}><X size={16} /></button></div>}
    </div>
  )
}

export default App