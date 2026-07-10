import Seo from "#components/Seo";
import ContractBuilder from "../components/organisms/contract/ContractBuilder";
import "./hop-dong.css";

const HopDongPage = () => {
  return (
    <>
      <Seo
        title="Hợp đồng dịch vụ"
        description="Tạo hợp đồng cung cấp dịch vụ media, biên bản nghiệm thu và đề nghị thanh toán từ BeeZ Production."
        path="/hop-dong"
      />
      <ContractBuilder />
    </>
  );
};

export default HopDongPage;
