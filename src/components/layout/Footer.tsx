'use client';

const Footer = () => {
  return (
    <footer className="py-10 border-t border-[#a68b81]/20 bg-[#fcfaf8]">
      <div className="container mx-auto px-[5%] flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        {/* LOGO & COPYRIGHT */}
        <div className="flex flex-col gap-2">
          <a
            href="#hero"
            className="text-2xl md:text-[26px] font-bold text-[#2c2c2c] hover:opacity-70 transition-opacity"
            aria-label="Повернутися на початок"
          >
            Velvet<span className="text-[#fcb25e]">Skin</span>
          </a>
          <p className="text-[13px] text-[#fcb25e] tracking-wider uppercase font-medium">
            © {new Date().getFullYear()} Всі права захищені. Запоріжжя
          </p>
        </div>

        {/* CATCHPHRASE */}
        <div className="footer-copy">
          <p className="font-vibes text-2xl md:text-[28px] text-[#535353] opacity-80">
            Зроблено з любов'ю до вашої шкіри 🤎
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
