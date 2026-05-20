type PageHeroProps =
  | {
      /** Image background mode — used by ServicePage */
      variant: "image";
      title: string;
      image: string;
      icon?: React.ReactNode;
      height?: string;
    }
  | {
      /** Centered text mode — used by ContactPage and similar */
      variant?: "text";
      title: string;
      subtitle?: string;
    };

const PageHero: React.FC<PageHeroProps> = (props) => {
  if (props.variant === "image") {
    const { title, image, icon, height = "h-[60vh]" } = props;
    return (
      <div className={`relative ${height} w-full overflow-hidden`}>
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <div className="from-background via-background/40 absolute inset-0 bg-linear-to-t to-transparent" />
        <div className="absolute bottom-0 left-0 px-6 pb-10 md:px-12">
          {icon && (
            <div className="bg-primary text-primary-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
              {icon}
            </div>
          )}
          <h1 className="text-4xl font-bold text-white md:text-5xl">{title}</h1>
        </div>
      </div>
    );
  }

  // Default: centered text hero
  const { title, subtitle } = props;
  return (
    <div className="pt-32 pb-16 text-center">
      <h1 className="text-foreground text-4xl font-bold md:text-5xl">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageHero;
