import { useState, useEffect, useRef } from 'react';

const OMDB_KEY = 'db2345d6';
const OMDB = (q) => `https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${OMDB_KEY}`;
const JIKAN_SEARCH = (q) => `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=12`;
const JIKAN_TOP = 'https://api.jikan.moe/v4/top/anime?limit=12';
const OMDB_POPULAR = `https://www.omdbapi.com/?s=action&apikey=${OMDB_KEY}`;

/* ───── Spinner ───── */
function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div
        style={{
          width: 48, height: 48,
          border: '4px solid #333',
          borderTop: '4px solid #E50914',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ───── Star Rating ───── */
function Stars({ score }) {
  if (!score) return null;
  const filled = Math.round((score / 10) * 5);
  return (
    <span style={{ color: '#FBBF24', fontSize: 12 }}>
      {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
      <span style={{ color: '#A3A3A3', marginLeft: 4 }}>{score.toFixed ? score.toFixed(1) : score}</span>
    </span>
  );
}

/* ───── Card ───── */
function Card({ poster, title, year, rating, score, onDetail }) {
  const [hovered, setHovered] = useState(false);
  const noImg = 'https://via.placeholder.com/300x440/1A1A1A/666?text=No+Poster';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1A1A1A',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'transform .25s, box-shadow .25s',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? '0 16px 40px rgba(229,9,20,.35)' : '0 2px 8px rgba(0,0,0,.5)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', paddingTop: '140%', background: '#111' }}>
        <img
          src={poster && poster !== 'N/A' ? poster : noImg}
          alt={title}
          onError={(e) => { e.target.src = noImg; }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            transition: 'opacity .3s',
            opacity: hovered ? 0.75 : 1,
          }}
        />
        {rating && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: '#E50914', color: '#fff',
            fontSize: 11, fontWeight: 700,
            padding: '2px 7px', borderRadius: 6,
          }}>{rating}</span>
        )}
      </div>
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{
          fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: '#fff',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{title}</p>
        {year && <p style={{ fontSize: 12, color: '#A3A3A3' }}>{year}</p>}
        {score && <Stars score={score} />}
        <button
          onClick={onDetail}
          style={{
            marginTop: 'auto', padding: '7px 0',
            background: hovered ? '#E50914' : 'transparent',
            border: '1.5px solid #E50914',
            color: hovered ? '#fff' : '#E50914',
            borderRadius: 7, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'background .2s, color .2s',
          }}
        >Lihat Detail</button>
      </div>
    </div>
  );
}

/* ───── Modal Detail ───── */
function Modal({ item, mode, onClose }) {
  if (!item) return null;
  const isAnime = mode === 'anime';
  const poster = isAnime ? item.images?.jpg?.large_image_url : item.Poster;
  const title = isAnime ? item.title : item.Title;
  const year = isAnime ? item.aired?.prop?.from?.year : item.Year;
  const score = isAnime ? item.score : null;
  const synopsis = isAnime ? item.synopsis : item.Plot;
  const genre = isAnime ? item.genres?.map(g => g.name).join(', ') : item.Genre;
  const episodes = isAnime ? item.episodes : null;
  const noImg = 'https://via.placeholder.com/300x440/1A1A1A/666?text=No+Poster';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1A1A1A', borderRadius: 16,
          maxWidth: 700, width: '100%', maxHeight: '90vh',
          overflow: 'auto', position: 'relative',
          boxShadow: '0 24px 80px rgba(229,9,20,.3)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 14,
            background: '#333', border: 'none', color: '#fff',
            width: 32, height: 32, borderRadius: '50%',
            fontSize: 18, cursor: 'pointer', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          <img
            src={poster && poster !== 'N/A' ? poster : noImg}
            alt={title}
            onError={(e) => { e.target.src = noImg; }}
            style={{ width: 220, flexShrink: 0, objectFit: 'cover', borderRadius: '16px 0 0 16px' }}
          />
          <div style={{ flex: 1, minWidth: 200, padding: '28px 24px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{title}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {year && <Tag>{year}</Tag>}
              {score && <Tag style={{ background: '#E50914' }}>⭐ {score}</Tag>}
              {episodes && <Tag>{episodes} Eps</Tag>}
              {item.Rated && <Tag>{item.Rated}</Tag>}
              {item.Runtime && <Tag>{item.Runtime}</Tag>}
            </div>
            {genre && <p style={{ fontSize: 13, color: '#A3A3A3', marginBottom: 12 }}><b style={{ color: '#fff' }}>Genre:</b> {genre}</p>}
            {item.Director && <p style={{ fontSize: 13, color: '#A3A3A3', marginBottom: 12 }}><b style={{ color: '#fff' }}>Sutradara:</b> {item.Director}</p>}
            {item.Actors && <p style={{ fontSize: 13, color: '#A3A3A3', marginBottom: 12 }}><b style={{ color: '#fff' }}>Pemeran:</b> {item.Actors}</p>}
            {synopsis && synopsis !== 'N/A' && (
              <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
                {synopsis.length > 400 ? synopsis.slice(0, 400) + '…' : synopsis}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ children, style = {} }) {
  return (
    <span style={{
      background: '#333', color: '#fff',
      fontSize: 12, padding: '3px 9px', borderRadius: 20,
      fontWeight: 600, ...style,
    }}>{children}</span>
  );
}

/* ───── Section Horizontal Scroll (Netflix-style) ───── */
const arrowBtnStyle = {
  background: 'rgba(229,9,20,.15)',
  border: '1.5px solid rgba(229,9,20,.4)',
  color: '#fff', width: 36, height: 36,
  borderRadius: '50%', cursor: 'pointer',
  fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background .2s, border .2s',
  flexShrink: 0,
};

function Section({ title, items, mode, onSelect }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 640, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 44 }}>
      <style>{`.hscroll::-webkit-scrollbar{display:none}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingRight: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 4, height: 26, background: '#E50914', borderRadius: 2, display: 'inline-block' }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => scroll(-1)} style={arrowBtnStyle} aria-label="Geser kiri">‹</button>
          <button onClick={() => scroll(1)} style={arrowBtnStyle} aria-label="Geser kanan">›</button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="hscroll"
        style={{
          display: 'flex',
          gap: 14,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: 6,
        }}
      >
        {items.map((it, i) => {
          const isAnime = mode === 'anime';
          return (
            <div key={i} style={{ flexShrink: 0, width: 162 }}>
              <Card
                poster={isAnime ? it.images?.jpg?.image_url : it.Poster}
                title={isAnime ? it.title : it.Title}
                year={isAnime ? it.aired?.prop?.from?.year : it.Year}
                score={isAnime ? it.score : null}
                rating={!isAnime ? it.Rated : null}
                onDetail={() => onSelect(it)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───── Top Weekly Section ───── */
function TopWeeklySection({ title, items, mode, onSelect }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ width: 4, height: 26, background: '#E50914', borderRadius: 2, display: 'inline-block' }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{title}</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {items.map((it, i) => {
          const isAnime = mode === 'anime';
          const poster = isAnime ? it.images?.jpg?.image_url : it.Poster;
          const titleText = isAnime ? it.title : it.Title;
          const score = isAnime ? it.score : null;
          const rating = !isAnime ? it.Rated : null;
          const genre = isAnime ? it.genres?.map(g => g.name).join(', ') : it.Genre;
          
          return (
            <div 
              key={i} 
              onClick={() => onSelect(it)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: '#1A1A1A', padding: '12px 16px', borderRadius: 12,
                cursor: 'pointer', transition: 'background .2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2A2A2A'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1A1A1A'}
            >
              <div style={{
                width: 24, fontSize: 22, fontWeight: 900, textAlign: 'center',
                color: i < 3 ? '#E50914' : '#666'
              }}>
                {i + 1}
              </div>
              <img 
                src={poster && poster !== 'N/A' ? poster : 'https://via.placeholder.com/60x80/1A1A1A/666?text=No+Img'}
                alt={titleText}
                style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 6 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {titleText}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#A3A3A3', flexWrap: 'wrap' }}>
                  {score ? <span style={{ color: '#FBBF24', fontWeight: 600 }}>⭐ {score}</span> : null}
                  {rating && rating !== 'N/A' ? <span style={{ background: '#333', color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>{rating}</span> : null}
                  {genre && genre !== 'N/A' ? <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{genre}</span> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───── Jadwal Page ───── */
function JadwalPage({ data, loading, activeDay, onDayChange, onSelect }) {
  const daysID = [
    { id: 'monday', label: 'Senin' },
    { id: 'tuesday', label: 'Selasa' },
    { id: 'wednesday', label: 'Rabu' },
    { id: 'thursday', label: 'Kamis' },
    { id: 'friday', label: 'Jumat' },
    { id: 'saturday', label: 'Sabtu' },
    { id: 'sunday', label: 'Minggu' },
  ];

  const convertTime = (jst) => {
    if (!jst) return 'TBA';
    const [h, m] = jst.split(':');
    let wibH = (parseInt(h) - 2 + 24) % 24;
    return `${wibH.toString().padStart(2, '0')}:${m} WIB`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 6, height: 32, background: '#E50914', borderRadius: 3, display: 'inline-block' }} />
        Jadwal Anime Mingguan
      </h2>
      
      <div className="hscroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 24, paddingBottom: 8 }}>
        {daysID.map(d => (
          <button
            key={d.id}
            onClick={() => onDayChange(d.id)}
            style={{
              padding: '10px 24px', borderRadius: 30, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap',
              background: activeDay === d.id ? '#E50914' : '#1A1A1A',
              color: activeDay === d.id ? '#fff' : '#A3A3A3',
              transition: 'all .2s',
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {data.map((it, i) => (
            <div key={i} style={{ position: 'relative' }}>
               <Card
                poster={it.images?.jpg?.image_url}
                title={it.title}
                score={it.score}
                onDetail={() => onSelect(it)}
              />
              <div style={{ 
                position: 'absolute', top: 8, left: 8, 
                background: '#000', color: '#fff', fontSize: 11, fontWeight: 700, 
                padding: '4px 8px', borderRadius: 6, border: '1px solid #333'
              }}>
                🕒 {convertTime(it.broadcast?.time)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Musim Ini Page ───── */
function MusimIniPage({ data, loading, filter, onFilterChange, onSelect }) {
  const genres = ['All', 'Action', 'Romance', 'Comedy', 'Fantasy', 'Horror'];
  
  const filteredData = filter === 'All' 
    ? data 
    : data.filter(it => it.genres?.some(g => g.name === filter));

  const isNew = (dateStr) => {
    if (!dateStr) return false;
    const diff = new Date() - new Date(dateStr);
    return diff < 30 * 24 * 60 * 60 * 1000;
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 6, height: 32, background: '#E50914', borderRadius: 3, display: 'inline-block' }} />
        Anime Musim Ini
      </h2>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {genres.map(g => (
          <button
            key={g}
            onClick={() => onFilterChange(g)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: '1.5px solid #333', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              background: filter === g ? '#E50914' : 'transparent',
              color: filter === g ? '#fff' : '#ccc',
              borderColor: filter === g ? '#E50914' : '#333',
              transition: 'all .2s',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {filteredData.map((it, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {isNew(it.aired?.from) && (
                <div style={{
                  position: 'absolute', top: -10, right: -10, zIndex: 10,
                  background: '#E50914', color: '#fff', fontSize: 11, fontWeight: 900,
                  padding: '4px 8px', borderRadius: 6, boxShadow: '0 4px 10px rgba(229,9,20,.5)'
                }}>
                  BARU
                </div>
              )}
              <Card
                poster={it.images?.jpg?.image_url}
                title={it.title}
                score={it.score}
                year={it.studios?.[0]?.name || 'Unknown Studio'}
                onDetail={() => onSelect(it)}
              />
              <div style={{ marginTop: 8, fontSize: 13, color: '#A3A3A3', display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                <span style={{ background: '#333', padding: '2px 8px', borderRadius: 4, fontSize: 11, color: '#fff' }}>{it.episodes ? `${it.episodes} Eps` : '? Eps'}</span>
                <span>{it.aired?.prop?.from?.year ? `${it.aired.prop.from.day}/${it.aired.prop.from.month}/${it.aired.prop.from.year}` : 'TBA'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Main App ───── */
export default function App() {
  const [mode, setMode] = useState('anime'); // 'anime' | 'film'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  
  // Home Sections State
  const [topAnime, setTopAnime] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [movieAnime, setMovieAnime] = useState([]);
  const [romanceAnime, setRomanceAnime] = useState([]);
  const [actionAnime, setActionAnime] = useState([]);
  const [popularFilm, setPopularFilm] = useState([]);
  const [filmAction, setFilmAction] = useState([]);
  const [filmHorror, setFilmHorror] = useState([]);
  const [filmMarvel, setFilmMarvel] = useState([]);
  const [topWeeklyAnime, setTopWeeklyAnime] = useState([]);
  const [topWeeklyFilm, setTopWeeklyFilm] = useState([]);

  // New Features State
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'jadwal' | 'musim_ini'
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [activeDay, setActiveDay] = useState('');
  
  const [seasonData, setSeasonData] = useState([]);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [seasonGenreFilter, setSeasonGenreFilter] = useState('All');

  // General Status State
  const [loading, setLoading] = useState(false);
  const [homeLoading, setHomeLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [homeFilter, setHomeFilter] = useState('all'); // 'all' | 'anime' | 'film'
  const inputRef = useRef(null);

  /* scroll effect on navbar */
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* fetch homepage defaults */
  useEffect(() => {
    setHomeLoading(true);
    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    const fetchAll = async () => {
      try {
        // OMDB: fetch paralel (tidak ada rate limit ketat)
        const [filmData, filmActionData, filmHorrorData, filmMarvelData, topFilmData] = await Promise.all([
          fetch(OMDB_POPULAR).then(r => r.json()),
          fetch(`https://www.omdbapi.com/?s=action&type=movie&apikey=${OMDB_KEY}`).then(r => r.json()),
          fetch(`https://www.omdbapi.com/?s=horror&type=movie&apikey=${OMDB_KEY}`).then(r => r.json()),
          fetch(`https://www.omdbapi.com/?s=marvel&type=movie&apikey=${OMDB_KEY}`).then(r => r.json()),
          fetch(`https://www.omdbapi.com/?s=2024&type=movie&apikey=${OMDB_KEY}`).then(r => r.json()),
        ]);
        setPopularFilm(filmData.Search || []);
        setFilmAction(filmActionData.Search || []);
        setFilmHorror(filmHorrorData.Search || []);
        setFilmMarvel(filmMarvelData.Search || []);
        setTopWeeklyFilm((topFilmData.Search || []).slice(0, 10));
        setHomeLoading(false); // tampilkan halaman secepatnya

        // Jikan: fetch sekuensial agar tidak kena rate limit (3 req/s)
        const jikanQueue = [
          { url: 'https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=10', setter: setTopWeeklyAnime },
          { url: JIKAN_TOP, setter: setTopAnime },
          { url: 'https://api.jikan.moe/v4/top/anime?filter=airing&limit=12', setter: setTrendingAnime },
          { url: 'https://api.jikan.moe/v4/top/anime?type=movie&limit=12', setter: setMovieAnime },
          { url: 'https://api.jikan.moe/v4/anime?genres=22&order_by=score&limit=12', setter: setRomanceAnime },
          { url: 'https://api.jikan.moe/v4/anime?genres=1&order_by=score&limit=12', setter: setActionAnime },
        ];
        for (const { url, setter } of jikanQueue) {
          try {
            const res = await fetch(url);
            const data = await res.json();
            setter(data.data || []);
          } catch { /* skip section bila gagal */ }
          await delay(450); // jeda antar request Jikan
        }
      } catch {
        setHomeLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* search handler */
  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      if (mode === 'anime') {
        const res = await fetch(JIKAN_SEARCH(q));
        const data = await res.json();
        if (!data.data?.length) throw new Error('Anime tidak ditemukan.');
        setResults({ mode: 'anime', items: data.data });
      } else {
        const res = await fetch(OMDB(q));
        if (!res.ok) throw new Error(`Gagal menghubungi server (HTTP ${res.status}).`);
        const data = await res.json();
        if (data.Response !== 'True') throw new Error(data.Error || 'Film tidak ditemukan.');
        if (!Array.isArray(data.Search) || data.Search.length === 0) throw new Error('Film tidak ditemukan.');
        setResults({ mode: 'film', items: data.Search });
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil data. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const clearSearch = () => {
    setResults(null);
    setError('');
    setQuery('');
    inputRef.current?.focus();
  };

  /* fetch Jadwal & Musim Ini */
  const fetchJadwal = async (day) => {
    setScheduleLoading(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScheduleData(data.data || []);
    } catch {
      setError('Gagal mengambil jadwal. Coba lagi.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const fetchMusimIni = async () => {
    if (seasonData.length > 0) return;
    setSeasonLoading(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/seasons/now?limit=24`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSeasonData(data.data || []);
    } catch {
      setError('Gagal mengambil daftar anime musim ini.');
    } finally {
      setSeasonLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage === 'jadwal') {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[new Date().getDay()];
      if (!activeDay) {
        setActiveDay(today);
        fetchJadwal(today);
      }
    } else if (currentPage === 'musim_ini') {
      fetchMusimIni();
    }
  }, [currentPage]);

  const handleDayChange = (day) => {
    setActiveDay(day);
    fetchJadwal(day);
  };

  const changePage = (page) => {
    setCurrentPage(page);
    setResults(null);
    setError('');
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ganti mode pencarian + filter home + scroll atas */
  const handleModeSwitch = (m) => {
    setMode(m);
    setHomeFilter(m);
    changePage('home');
  };

  /* tombol logo — kembali ke home semua section */
  const goHome = () => {
    setHomeFilter('all');
    changePage('home');
  };

  /* ── OMDB detail fetch ── */
  const handleSelectFilm = async (item) => {
    if (item.imdbID) {
      try {
        const res = await fetch(`https://www.omdbapi.com/?i=${item.imdbID}&apikey=${OMDB_KEY}`);
        const data = await res.json();
        if (data.Response !== 'False') { setSelected({ ...data, _mode: 'film' }); return; }
      } catch {}
    }
    setSelected({ ...item, _mode: 'film' });
  };

  const handleSelectAnime = (item) => setSelected({ ...item, _mode: 'anime' });

  return (
    <>
      {/* Google Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
        background: navScrolled ? 'rgba(10,10,10,.96)' : 'transparent',
        backdropFilter: navScrolled ? 'blur(12px)' : 'none',
        borderBottom: navScrolled ? '1px solid #222' : 'none',
        transition: 'background .3s, border .3s',
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        {/* Logo */}
        <button onClick={goHome} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 22, fontWeight: 900, color: '#E50914', letterSpacing: '-0.5px',
          flexShrink: 0,
        }}>GasNonton 🎬</button>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{
          flex: 1, maxWidth: 480,
          display: 'flex', gap: 0,
          background: '#1A1A1A',
          borderRadius: 8, overflow: 'hidden',
          border: '1.5px solid #333',
        }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'anime' ? 'Cari anime...' : 'Cari film...'}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: '#fff', padding: '0 14px', fontSize: 14, outline: 'none',
              height: 40,
            }}
          />
          <button type="submit" style={{
            background: '#E50914', border: 'none', color: '#fff',
            padding: '0 18px', cursor: 'pointer', fontSize: 16,
            transition: 'background .2s',
          }}>🔍</button>
        </form>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'film', label: '🎥 Film', type: 'filter' },
            { id: 'anime', label: '🍥 Anime', type: 'filter' },
            { id: 'jadwal', label: '📅 Jadwal', type: 'page' },
            { id: 'musim_ini', label: '🌸 Musim Ini', type: 'page' },
          ].map((m) => {
            const isActive = m.type === 'page' ? currentPage === m.id : (currentPage === 'home' && homeFilter === m.id);
            return (
              <button key={m.id} onClick={() => m.type === 'page' ? changePage(m.id) : handleModeSwitch(m.id)} style={{
                background: isActive ? '#E50914' : 'transparent',
                border: '1.5px solid ' + (isActive ? '#E50914' : '#444'),
                color: '#fff', padding: '6px 16px', borderRadius: 7,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all .2s',
              }}>{m.label}</button>
            )
          })}
        </div>
      </nav>

      {/* ── HERO ── */}
      {!results && currentPage === 'home' && (
        <div style={{
          minHeight: '60vh',
          background: 'linear-gradient(180deg, #1a0000 0%, #0A0A0A 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          paddingTop: 80, paddingBottom: 40,
          textAlign: 'center', padding: '80px 24px 40px',
        }}>
          <p style={{ fontSize: 13, color: '#E50914', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
            🇮🇩 Database Anime &amp; Film Indonesia
          </p>
          <h1 style={{
            fontSize: 'clamp(28px,6vw,62px)', fontWeight: 900,
            lineHeight: 1.1, color: '#fff', marginBottom: 12,
            textShadow: '0 4px 24px rgba(229,9,20,.4)',
          }}>
            Temukan Film &amp; Anime<br />
            <span style={{ color: '#E50914' }}>Favoritmu</span>
          </h1>
          <p style={{ color: '#A3A3A3', fontSize: 16, marginBottom: 32 }}>
            Ribuan judul tersedia — anime, film, serial, dan lebih banyak lagi.
          </p>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex', background: '#1A1A1A',
            borderRadius: 10, padding: 4, marginBottom: 20,
            border: '1px solid #333',
          }}>
            {[{ v: 'anime', label: '🍥 Anime' }, { v: 'film', label: '🎥 Film' }].map(({ v, label }) => (
              <button key={v} onClick={() => handleModeSwitch(v)} style={{
                padding: '8px 28px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: homeFilter === v ? '#E50914' : 'transparent',
                color: '#fff', fontWeight: 700, fontSize: 15,
                transition: 'background .2s',
              }}>{label}</button>
            ))}
          </div>

          {/* Big Search */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', width: '100%', maxWidth: 580, gap: 0,
            background: '#fff', borderRadius: 10, overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(229,9,20,.25)',
          }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'anime' ? 'Cari anime, mis. "Naruto"...' : 'Cari film, mis. "Avengers"...'}
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '16px 20px', fontSize: 16, background: 'transparent',
                color: '#111',
              }}
            />
            <button type="submit" style={{
              background: '#E50914', border: 'none', color: '#fff',
              padding: '0 28px', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', transition: 'background .2s',
            }}>Cari</button>
          </form>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Error */}
        {error && (
          <div style={{
            background: '#2A0A0A', border: '1px solid #E50914',
            borderRadius: 10, padding: '16px 20px', marginBottom: 24,
            color: '#FF6B6B', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <b>Oops!</b> {error}
              <button onClick={clearSearch} style={{
                marginLeft: 12, background: 'none', border: 'none',
                color: '#E50914', cursor: 'pointer', fontWeight: 600,
              }}>← Kembali</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {(loading || homeLoading) && <Spinner />}

        {/* Search Results */}
        {!loading && results && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                Hasil pencarian: <span style={{ color: '#E50914' }}>"{query}"</span>
                <span style={{ color: '#A3A3A3', fontWeight: 400, fontSize: 15, marginLeft: 8 }}>({results.items.length} judul)</span>
              </h2>
              <button onClick={clearSearch} style={{
                background: 'transparent', border: '1.5px solid #444',
                color: '#A3A3A3', padding: '6px 16px', borderRadius: 7,
                cursor: 'pointer', fontSize: 13,
              }}>← Kembali</button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16,
            }}>
              {results.items.map((it, i) => {
                const isAnime = results.mode === 'anime';
                return (
                  <Card
                    key={i}
                    poster={isAnime ? it.images?.jpg?.image_url : it.Poster}
                    title={isAnime ? it.title : it.Title}
                    year={isAnime ? it.aired?.prop?.from?.year : it.Year}
                    score={isAnime ? it.score : null}
                    rating={!isAnime ? it.Rated : null}
                    onDetail={() => isAnime ? handleSelectAnime(it) : handleSelectFilm(it)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Pages */}
        {!loading && !results && !error && (
          <>
            {currentPage === 'home' && (
              <>
                {/* Top Weekly */}
                {(homeFilter === 'all' || homeFilter === 'anime') && <TopWeeklySection title="🔥 Top Anime Minggu Ini" items={topWeeklyAnime} mode="anime" onSelect={handleSelectAnime} />}
                {(homeFilter === 'all' || homeFilter === 'film') && <TopWeeklySection title="🔥 Top Film Minggu Ini" items={topWeeklyFilm} mode="film" onSelect={handleSelectFilm} />}
                
                {/* Anime sections — muncul saat filter 'all' atau 'anime' */}
                {(homeFilter === 'all' || homeFilter === 'anime') && (
                  <>
                    <Section title="🔥 Anime Trending Sekarang" items={trendingAnime} mode="anime" onSelect={handleSelectAnime} />
                    <Section title="🍥 Anime Populer Sepanjang Masa" items={topAnime} mode="anime" onSelect={handleSelectAnime} />
                    <Section title="🏆 Anime Movie Terbaik" items={movieAnime} mode="anime" onSelect={handleSelectAnime} />
                    <Section title="💘 Anime Romance Populer" items={romanceAnime} mode="anime" onSelect={handleSelectAnime} />
                    <Section title="⚔️ Anime Action Terbaik" items={actionAnime} mode="anime" onSelect={handleSelectAnime} />
                  </>
                )}
                {/* Film sections — muncul saat filter 'all' atau 'film' */}
                {(homeFilter === 'all' || homeFilter === 'film') && (
                  <>
                    <Section title="🎥 Film Populer" items={popularFilm} mode="film" onSelect={handleSelectFilm} />
                    <Section title="💥 Film Action" items={filmAction} mode="film" onSelect={handleSelectFilm} />
                    <Section title="🦸 Film Marvel" items={filmMarvel} mode="film" onSelect={handleSelectFilm} />
                    <Section title="👻 Film Horror" items={filmHorror} mode="film" onSelect={handleSelectFilm} />
                  </>
                )}
              </>
            )}

            {currentPage === 'jadwal' && (
              <JadwalPage 
                data={scheduleData} 
                loading={scheduleLoading} 
                activeDay={activeDay} 
                onDayChange={handleDayChange} 
                onSelect={handleSelectAnime} 
              />
            )}

            {currentPage === 'musim_ini' && (
              <MusimIniPage 
                data={seasonData} 
                loading={seasonLoading} 
                filter={seasonGenreFilter} 
                onFilterChange={setSeasonGenreFilter} 
                onSelect={handleSelectAnime} 
              />
            )}
          </>
        )}

      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        textAlign: 'center', padding: '24px 16px',
        borderTop: '1px solid #222',
        color: '#555', fontSize: 13,
      }}>
        <span style={{ color: '#E50914', fontWeight: 700 }}>GasNonton 🎬</span> &nbsp;·&nbsp;
        Data dari <a href="https://www.omdbapi.com" target="_blank" rel="noreferrer" style={{ color: '#E50914' }}>OMDB</a> &amp;&nbsp;
        <a href="https://jikan.moe" target="_blank" rel="noreferrer" style={{ color: '#E50914' }}>Jikan (MyAnimeList)</a>
        &nbsp;·&nbsp; © {new Date().getFullYear()}
      </footer>

      {/* ── MODAL ── */}
      {selected && (
        <Modal
          item={selected}
          mode={selected._mode}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
