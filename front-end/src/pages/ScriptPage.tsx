import Seo from "#components/Seo";

const ScriptPage = () => {
  return (
    <>
      <Seo
        title="Báo giá dịch vụ"
        description="Nhận báo giá dịch vụ sản xuất video, TVC và brand film từ BeeZ Production."
        path="/bao-gia"
      />
      <iframe
        src="https://script.google.com/macros/s/AKfycbxpjBUuVXucUFAZvA--zEzUrW3gEFJxhSh24iGD42qHqRmp8eJn-FfyJCXmC6Ut1vs/exec"
        title="BeeZ Production — Báo giá dịch vụ"
        className="block h-screen w-full border-none"
        allowFullScreen
      ></iframe>
    </>
  );
};

export default ScriptPage;
