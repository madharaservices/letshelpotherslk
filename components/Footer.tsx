// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-8 mt-10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-slate-500 text-sm mb-2">
          © {new Date().getFullYear()} HelpSL Disaster Response.
        </p>
        <p className="text-slate-400 text-xs">
          Developed by <a href="https://my-portfolio-lac-pi-12.vercel.app/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Padumainduwra</a>
        </p>
      </div>
    </footer>
  );
}