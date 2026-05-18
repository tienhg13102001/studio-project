type Props = {
  title: string;
  subtitle: string;
};

const SectionHeader: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <div className="mb-16 text-center">
      <div className="mx-auto mb-6 h-0.5 w-8 bg-primary"></div>
      <h2 className="mb-4 text-4xl font-bold tracking-tight text-secondary md:text-5xl">
        {title}
      </h2>
      <p className="text-sm text-gray-400 md:text-base">{subtitle}</p>
    </div>
  );
};

export default SectionHeader;
