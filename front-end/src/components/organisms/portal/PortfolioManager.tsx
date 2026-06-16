import PortfolioTab from "#components/organisms/portal/PortfolioTab";
import { usePortfolio } from "#hooks/usePortfolio";

/** Self-contained Portfolio manager — used as a tab inside Settings. */
const PortfolioManager = () => {
  const { data, loading, refetch } = usePortfolio();
  return <PortfolioTab data={data} loading={loading} onRefetch={refetch} />;
};

export default PortfolioManager;
