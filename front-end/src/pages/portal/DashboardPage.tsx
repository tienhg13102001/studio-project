import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "#hooks/useTeam";
import { useBrands } from "#hooks/useBrands";
import { useServices } from "#hooks/useServices";
import { useProjects } from "#hooks/useProjects";
import type { PortalUser } from "#lib/portal.types";
import PortalSidebar from "#components/organisms/portal/PortalSidebar";
import PortalHeader from "#components/molecules/portal/PortalHeader";
import OverviewTab from "#components/organisms/portal/OverviewTab";
import TeamTab from "#components/organisms/portal/TeamTab";
import BrandsTab from "#components/organisms/portal/BrandsTab";
import ServicesTab from "#components/organisms/portal/ServicesTab";
import ProjectsTab from "#components/organisms/portal/ProjectsTab";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: teamData,     loading: teamLoading,     refetch: refetchTeam    } = useTeam();
  const { data: brandsData,   loading: brandsLoading,   refetch: refetchBrands  } = useBrands();
  const { data: servicesData, raw: rawServices, loading: servicesLoading, refetch: refetchServices } = useServices("en");
  const { verticalCards, horizontalCards, raw: rawProjects, loading: projectsLoading, refetch: refetchProjects } = useProjects();
  const allProjects  = [...(verticalCards ?? []), ...(horizontalCards ?? [])];
  const rawProjectList = rawProjects ? [...rawProjects.verticalCards, ...rawProjects.horizontalCards] : null;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("portal_user")!;
      setUser(JSON.parse(raw) as PortalUser);
    } catch {
      navigate("/portal", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("portal_user");
    navigate("/portal", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <PortalSidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <PortalHeader userName={user.name} />

        <div className="px-8 py-8 flex flex-col gap-8">
          {activeTab === "overview" && (
            <OverviewTab
              teamData={teamData}       teamLoading={teamLoading}
              brandsData={brandsData}   brandsLoading={brandsLoading}
              servicesData={servicesData}
              allProjects={allProjects}
              onTabChange={setActiveTab}
            />
          )}
          {activeTab === "team"     && <TeamTab     data={teamData}     loading={teamLoading}     onRefetch={refetchTeam}     />}
          {activeTab === "brands"   && <BrandsTab   data={brandsData}   loading={brandsLoading}   onRefetch={refetchBrands}   />}
          {activeTab === "services" && <ServicesTab data={servicesData} raw={rawServices}         loading={servicesLoading}  onRefetch={refetchServices} />}
          {activeTab === "projects" && <ProjectsTab data={allProjects}  raw={rawProjectList}      services={rawServices}     loading={projectsLoading}   onRefetch={refetchProjects} />}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
