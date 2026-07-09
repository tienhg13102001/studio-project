import Seo from "#components/Seo";
import QuoteBuilder from "../components/organisms/quote/QuoteBuilder";
import "./bao-gia.css";

const BaoGiaPage = () => {
  return (
    <>
      <Seo
        title="Báo giá dịch vụ"
        description="Tạo báo giá dịch vụ sản xuất video, TVC và brand film từ BeeZ Production."
        path="/bao-gia"
      />
      <QuoteBuilder />
    </>
  );
};

export default BaoGiaPage;
