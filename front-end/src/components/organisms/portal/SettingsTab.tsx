import LandingTab from "#components/organisms/portal/LandingTab";
import TeamContentTab from "#components/organisms/portal/TeamContentTab";
import PortfolioManager from "#components/organisms/portal/PortfolioManager";
import SharedTab from "#components/organisms/portal/SharedTab";
import { HouseIcon, ImageIcon, ImagesSquareIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { useState } from "react";

type TabDef = {
  id: string;
  label: string;
  icon: React.ReactNode;
  render: () => React.ReactNode;
};

const TABS: TabDef[] = [
  {
    id: "landing",
    label: "Landing page",
    icon: <HouseIcon size={14} weight="duotone" />,
    render: () => <LandingTab />,
  },
  {
    id: "team",
    label: "Team page",
    icon: <UsersThreeIcon size={14} weight="duotone" />,
    render: () => <TeamContentTab />,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: <ImagesSquareIcon size={14} weight="duotone" />,
    render: () => <PortfolioManager />,
  },
  {
    id: "shared",
    label: "Dùng chung",
    icon: <ImageIcon size={14} weight="duotone" />,
    render: () => <SharedTab />,
  },
];

const SettingsTab = () => {
  const [active, setActive] = useState(TABS[0]?.id ?? "landing");
  const current = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>

        {/* Tab strip — scrolls horizontally on narrow screens */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-foreground/8">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={[
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm whitespace-nowrap transition-all",
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-foreground/40 hover:text-foreground",
                ].join(" ")}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {current?.render()}
    </>
  );
};

export default SettingsTab;
