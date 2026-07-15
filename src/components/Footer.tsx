import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-black">
              S
            </span>
            <p className="font-bold">Start Digital</p>
          </div>
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            Ribuan prompt AI berkualitas tinggi untuk bisnis, marketing, coding,
            desain, produktivitas, dan konten.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Produk</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="/prompts" className="hover:text-white">Jelajahi Prompt</Link></li>
            <li><Link href="/kategori" className="hover:text-white">Kategori</Link></li>
            <li><Link href="/asisten" className="hover:text-white">AI Asisten</Link></li>
            <li><Link href="/harga" className="hover:text-white">Harga & Membership</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Akun & Legal</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="/dashboard" className="hover:text-white">Dashboard User</Link></li>
            <li><Link href="/dashboard?tab=favorit" className="hover:text-white">Favorit</Link></li>
            <li><Link href="/syarat-ketentuan" className="hover:text-white">Syarat & Ketentuan</Link></li>
            <li><Link href="/kebijakan-privasi" className="hover:text-white">Kebijakan Privasi</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Didukung Oleh</h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {["ChatGPT", "Claude", "Gemini", "Grok", "DeepSeek", "Copilot"].map(
              (a) => (
                <span
                  key={a}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                >
                  {a}
                </span>
              )
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Start Digital AI Prompt Premium. Semua hak
        dilindungi.
      </div>
    </footer>
  );
}
