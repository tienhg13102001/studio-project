import type { ServiceDisplay } from "#hooks/useServices";
import { useState } from "react";

type Props = {
  service: ServiceDisplay;
};

const ServiceCard: React.FC<Props> = ({ service }) => {
  // Fall back to a branded gradient when the thumbnail is missing/broken so the
  // card never shows a broken-image icon + alt text.
  const [imgOk, setImgOk] = useState(true);

  return (
    <div
      className="group border-border/30 from-primary/15 via-card to-background relative h-60 cursor-pointer overflow-hidden rounded-2xl border bg-linear-to-br transition-shadow duration-300 hover:shadow-lg"
      onClick={() => (window.location.href = `/service/${service.id}`)}
    >
      {/* Hình nền với hiệu ứng zoom khi hover */}
      {imgOk && (
        <img
          src={service.thumbnailImage}
          alt={service.title}
          loading="lazy"
          onError={() => setImgOk(false)}
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-80"
        />
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-transparent" />

      {/* Nội dung */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-5">
        {/* Tiêu đề và Mô tả */}
        <div className="mt-auto translate-y-2 transform border-t border-white/20 pt-4 transition-transform duration-300 group-hover:translate-y-0">
          <h3 className="mb-2 text-xl font-semibold tracking-wide text-white">{service.title}</h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-300 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
