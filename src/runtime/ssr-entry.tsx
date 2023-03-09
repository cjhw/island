import { App, initPageData } from './app';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { DataContext } from './hooks';

export interface RenderResult {
  appHtml: string;
  islandProps: unknown[];
  islandToPathMap: Record<string, string>;
}

export async function render(pagePath: string) {
  const pageData = await initPageData(pagePath);
  const { clearIslandData, data } = await import('./jsx-runtime');
  // 拿到 islands 组件相关数据
  const { islandProps, islandToPathMap } = data;
  clearIslandData();

  const appHtml = renderToString(
    <DataContext.Provider value={pageData}>
      <StaticRouter location={pagePath}>
        <App />
      </StaticRouter>
    </DataContext.Provider>
  );

  return {
    appHtml,
    islandProps,
    islandToPathMap
  };
}

export { routes } from 'island:routes';
