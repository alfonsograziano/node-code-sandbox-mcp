import HeroSection from '../Components/pillars/HeroSection';
import PillarsOverviewSection from '../Components/pillars/PillarsOverviewSection';
import BasePillarsPage from '../Components/pillars/BasePillarsPage';
const Pillars: React.FC = () => {

  return (
    <BasePillarsPage>
      <HeroSection />
      <PillarsOverviewSection />
    </BasePillarsPage>
  );
};

export default Pillars;

