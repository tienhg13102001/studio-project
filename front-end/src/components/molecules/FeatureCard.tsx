import { srcSetAnh } from "#lib/api";
type CardProps = {
  id: string | number;
  tag: string;
  thumbnailImage: string;
  title: string;
  subtitle: string;
};

type Props = {
  card: CardProps;
  variant: "vertical" | "horizontal";
  onClick?: () => void;
};

const FeatureCard: React.FC<Props> = ({ card, variant, onClick }) => {
  const isVertical = variant === "vertical";

  return (
    // <button> chứ không phải <div onClick>: hàng giờ đứng yên cho khách tự chọn,
    // nên thẻ phải bấm được bằng bàn phím và đọc được bằng trình đọc màn hình.
    <button
      type="button"
      onClick={onClick}
      className={`group bg-card border-border focus-visible:ring-primary shrink-0 cursor-pointer overflow-hidden rounded-xl border text-left transition-transform duration-300 focus-visible:ring-2 focus-visible:outline-none ${
        isVertical ? "w-45 md:w-55" : "w-75 md:w-95"
      }`}
    >
      {/* Thumbnail */}
      <div className={`relative overflow-hidden ${isVertical ? "h-62.5 md:h-80" : "h-40 md:h-55"}`}>
        <img
          src={card.thumbnailImage}
          srcSet={srcSetAnh(card.thumbnailImage)}
          sizes={isVertical ? "220px" : "380px"}
          alt={card.title}
          loading="lazy"
          decoding="async"
          width={480}
          height={320}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="bg-primary text-primary-foreground absolute top-3 left-3 rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow md:text-xs">
          {card.tag}
        </span>
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-50" />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3
          className={`text-foreground line-clamp-2 font-semibold ${isVertical ? "text-sm" : "text-sm md:text-base"}`}
          title={card.title}
        >
          {card.title}
        </h3>
        <p
          className={`text-muted-foreground mt-0.5 truncate ${isVertical ? "text-xs" : "text-xs md:text-sm"}`}
          title={card.subtitle}
        >
          {card.subtitle}
        </p>
      </div>
    </button>
  );
};

export default FeatureCard;
