import Reveal from "#components/Reveal";
import { Button } from "#components/ui/button";
import { useTranslation } from "#i18n";
import { ArrowRightIcon, ChartLineUpIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center">
      <div className="from-primary/10 via-background pointer-events-none absolute inset-0 bg-linear-to-t to-transparent" />
      <div className="relative mx-auto max-w-2xl">
        <Reveal>
          <h2 className="text-foreground text-3xl font-bold md:text-4xl">{t.service.ctaTitle}</h2>
          <p className="text-muted-foreground mt-3 text-base">{t.service.ctaSubtitle}</p>
          <Button
            onClick={() => navigate("/contact")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 h-auto gap-2 rounded-full px-8 py-3 text-sm font-semibold"
          >
            <ChartLineUpIcon size={18} weight="bold" />
            {t.service.ctaButton}
            <ArrowRightIcon size={16} weight="bold" />
          </Button>
        </Reveal>
      </div>
    </section>
  );
};

export default CTASection;
