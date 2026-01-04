export default function Footer() {
  return (
    <footer className="bg-gradient-tropical mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <p className="text-sm">
            © {new Date().getFullYear()} TCS de Suzini - Tous droits réservés
          </p>
          <p className="text-xs mt-2 opacity-80">
            Développé par <span className="font-bold">Thiago Gomes</span>
          </p>
        </div>
      </div>
    </footer>
  );
}