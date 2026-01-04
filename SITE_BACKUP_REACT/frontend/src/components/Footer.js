export default function Footer() {
  return (
    <footer className="glass-card mt-auto py-6 border-0 rounded-none relative z-20" style={{ background: 'rgba(30, 36, 51, 0.95)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-300">
          <p className="text-sm">
            © {new Date().getFullYear()} TCS de Suzini - Tous droits réservés
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Développé par <span className="font-bold text-[#FF6B35]">Thiago Gomes</span>
          </p>
        </div>
      </div>
    </footer>
  );
}