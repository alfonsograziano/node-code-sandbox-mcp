import BasePillarsPage from './BasePillarsPage';
import { Link } from 'react-router-dom';
import PillarsTitle from './TitleSection';

const PillarPage: React.FC<{ component: React.ReactNode, articleTitle: string }> = ({ component, articleTitle }) => {
    return (
        <BasePillarsPage>
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 lg:py-20">
                <Link to="/pillars" className="text-green-400 hover:text-green-300 transition-colors duration-200 mb-8 inline-block">
                    ← Back to Home
                </Link>
                <PillarsTitle description='' />
                <h1 className='text-5xl md:text-7xl font-extrabold mb-8 md:mb-12 tracking-tight text-white'>{articleTitle}</h1>
                
                <article className="text-gray-300 leading-relaxed space-y-6">
                    {component}
                </article>
            </div>
        </BasePillarsPage>
    );
};

export default PillarPage;

