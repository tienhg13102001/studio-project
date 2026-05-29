import LandingTab from "#components/organisms/portal/LandingTab";
import { HouseIcon } from "@phosphor-icons/react";
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
];

const SettingsTab = () => {
  const [active, setActive] = useState(TABS[0]?.id ?? "landing");
  const current = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">Settings</h2>

        {/* Tab strip */}
        <div className="flex items-center gap-1 border-b border-white/8">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={[
                  "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-all",
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-white/40 hover:text-white",
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
