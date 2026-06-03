import { UsersThreeIcon, StarIcon, BriefcaseIcon, ImageSquareIcon } from "@phosphor-icons/react";
import type { ApiUser, ApiBrand } from "#lib/apiTypes";
import type { ServiceDisplay } from "#hooks/useServices";
import type { ProjectDisplay } from "#hooks/useProjects";
import { TeamTable } from "./TeamTab";
import { BrandsGrid } from "./BrandsTab";
import { Button } from "#components/ui/button";

type Props = {
  teamData:       ApiUser[]        | null;
  teamLoading:    boolean;
  brandsData:     ApiBrand[]       | null;
  brandsLoading:  boolean;
  servicesData:   ServiceDisplay[] | null;
  allProjects:    ProjectDisplay[];
  onTabChange:    (id: string) => void;
};

export default function OverviewTab({
  teamData, teamLoading,
  brandsData, brandsLoading,
  servicesData, allProjects,
  onTabChange,
}: Props) {
  const stats = [
    { label: "Team Members", value: teamData?.length    ?? "—", icon: <UsersThreeIcon  size={20} weight="duotone" />, color: "text-blue-400"    },
    { label: "Brands",       value: brandsData?.length  ?? "—", icon: <StarIcon         size={20} weight="duotone" />, color: "text-amber-400"  },
    { label: "Services",     value: servicesData?.length ?? "—",icon: <BriefcaseIcon    size={20} weight="duotone" />, color: "text-violet-400" },
    { label: "Projects",     value: allProjects.length  || "—", icon: <ImageSquareIcon  size={20} weight="duotone" />, color: "text-emerald-400"},
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((card) => (
          <div key={card.label} className="rounded-xl border border-foreground/8 bg-foreground/3 p-4 sm:p-5 flex flex-col gap-3">
            <div className={card.color}>{card.icon}</div>
            <div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-foreground/40 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Team preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground/80">Team Members</h2>
          <Button variant="link" onClick={() => onTabChange("team")} className="text-xs text-primary p-0 h-auto">
            View all
          </Button>
        </div>
        <TeamTable data={teamData} loading={teamLoading} preview />
      </section>

      {/* Brands preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground/80">Brands</h2>
          <Button variant="link" onClick={() => onTabChange("brands")} className="text-xs text-primary p-0 h-auto">
            View all
          </Button>
        </div>
        <BrandsGrid data={brandsData} loading={brandsLoading} preview />
      </section>
    </>
  );
}
