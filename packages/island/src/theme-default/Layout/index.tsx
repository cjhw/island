import { usePageData } from '../../runtime';
import 'uno.css';
import '../styles/base.css';
import '../styles/vars.css';
import '../styles/doc.css';
import { Nav } from '../../theme-default/components/Nav';
import { HomeLayout } from './HomeLayout/index';
import { DocLayout } from './DocLayout/index';
import { Helmet } from 'react-helmet-async';
import { NotFoundLayout } from './NotFoundLayout';

export function Layout() {
  const pageData = usePageData();
  // 获取 pageType
  const { pageType, title } = pageData;
  // 根据 pageType 分发不同的页面内容
  const getContent = () => {
    if (pageType === 'home') {
      return <HomeLayout />;
    } else if (pageType === 'doc') {
      return <DocLayout />;
    } else {
      return <NotFoundLayout />;
    }
  };
  return (
    <div>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Nav />
      <section
        style={{
          paddingTop: 'var(--island-nav-height)'
        }}
      >
        {getContent()}
      </section>
    </div>
  );
}
