import type { ServiceDisplay } from "#hooks/useServices";

type Props = {
  service: ServiceDisplay;
};

const ServiceCard: React.FC<Props> = ({ service }) => {
  return (
    <div className="group border-border/30 relative h-60 cursor-pointer overflow-hidden rounded-2xl border transition-shadow duration-300 hover:shadow-lg">
      {/* Hình nền với hiệu ứng zoom khi hover */}
      <img
        src={service.thumbnailImage}
        alt={service.title}
        className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-80"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-transparent" />

      {/* Nội dung */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-5">
        {/* Tiêu đề và Mô tả */}
        <div className="mt-auto translate-y-2 transform border-t border-white/20 pt-4 transition-transform duration-300 group-hover:translate-y-0">
          <h3 className="mb-2 text-xl font-semibold tracking-wide text-white">
            {service.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-300 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
