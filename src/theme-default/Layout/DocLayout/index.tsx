import { usePageData, Content } from '@runtime';
import { useLocation } from 'react-router-dom';
import { Aside } from '../../components/Aside';
import { DocFooter } from '../../components/DocFooter';
import { Sidebar } from '../../components/Sidebar';
import styles from './index.module.scss';

export function DocLayout() {
  const { siteData, toc } = usePageData();
  const sidebarData = siteData.themeConfig?.sidebar || {};
  const { pathname } = useLocation();
  const matchedSidebarKey = Object.keys(sidebarData).find((key) => {
    if (pathname.startsWith(key)) {
      return true;
    }
  });

  const matchedSidebar = sidebarData[matchedSidebarKey] || [];

  return (
    <div>
      <Sidebar sidebarData={matchedSidebar} pathname={pathname} />
      <div className={styles.content} flex="~">
        <div className={styles.docContent}>
          <div className="island-doc">
            <Content />
          </div>
          <DocFooter />
        </div>
        <div className={styles.asideContainer}>
          <Aside headers={toc} />
        </div>
      </div>
    </div>
  );
}
