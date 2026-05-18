import {
  DeviceMobileCameraIcon,
  PhoneIcon,
  TelevisionSimpleIcon,
} from "@phosphor-icons/react";
import type { FC, ElementType } from "react";
import { useMemo } from "react";
import { useLanguage, useTranslation } from "#i18n";
import { getServicesContent } from "../../mocks/servicesContent";

// Phần không dịch: icon & ảnh — map theo id
const SERVICE_META: Record<number, { icon: ElementType; image: string }> = {
  1: {
    icon: TelevisionSimpleIcon,
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  2: {
    icon: DeviceMobileCameraIcon,
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  3: {
    icon: PhoneIcon,
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
};

type Props = {};

const ServiceSection: FC<Props> = () => {
  const { lang } = useLanguage();
  const t = useTranslation();
  const services = useMemo(() => getServicesContent(lang), [lang]);

  return (
    <div className="bg-foreground min-h-dvh px-4 py-24 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Phần Tiêu đề */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 h-0.5 w-8 bg-yellow-500"></div>
          <h2 className="text-secondary mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            {t.services.sectionTitle}
          </h2>
          <p className="text-sm text-gray-400 md:text-base">
            {t.services.sectionSubtitle}
          </p>
        </div>

        {/* Lưới Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const meta = SERVICE_META[service.id];
            const Icon = meta.icon;
            return (
              <div
                key={service.id}
                className="group relative h-60 cursor-pointer overflow-hidden rounded-2xl bg-neutral-900"
              >
                {/* Hình nền với hiệu ứng zoom khi hover */}
                <img
                  src={meta.image}
                  alt={service.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-80"
                />

                {/* Overlay Gradient tối để làm nổi bật chữ */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-transparent"></div>

                {/* Nội dung Card */}
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
                  {/* Icon Container */}
                  <div className="flex items-start">
                    <div className="rounded-xl border border-white/10 bg-black/30 p-2.5 backdrop-blur-md transition-colors duration-300 group-hover:border-white/30 group-hover:bg-black/50">
                      <Icon className="h-5 w-5 text-gray-200" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Tiêu đề và Mô tả */}
                  <div className="translate-y-2 transform border-t border-white/20 pt-4 transition-transform duration-300 group-hover:translate-y-0">
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
          })}
        </div>
      </div>
    </div>
  );
};

export default ServiceSection;
