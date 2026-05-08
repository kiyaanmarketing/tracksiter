export default function Home() {
  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Tracksiter</h1>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)',
    padding: '24px',
  },
  card: {
    maxWidth: '720px',
    width: '100%',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)',
  },
  title: {
    margin: 0,
    fontSize: '2.8rem',
    color: '#111827',
  },
  description: {
    marginTop: '18px',
    lineHeight: 1.75,
    color: '#475569',
  },
};
