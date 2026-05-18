const SocialLinks = () => {
  return (
    <div className="flex items-center gap-3 mt-4 sm:mt-0">
      <a
        href="#"
        className="w-10 h-10 rounded-full insta-gradient flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
      >
        <i className="fa-brands fa-instagram text-lg" />
      </a>
      <a
        href="#"
        className="w-10 h-10 rounded-full zalo-bg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg font-bold text-[10px] tracking-tighter"
      >
        Zalo
      </a>
    </div>
  );
};

export default SocialLinks;
