import React from 'react';

import {Footer, Header} from '~/components';
import type {LayoutData} from '~/root';

export function Layout({
  layout,
  children,
}: {
  layout: LayoutData;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative flex min-h-screen flex-col">
        <a href="#main-content" className="sr-only">
          Skip to content
        </a>

        <Header
          menu={layout?.headerMenu}
          title={layout?.shop.name ?? 'Hydrogen'}
        />

        <main role="main" id="main-content" className="container">
          {children}
        </main>
      </div>

      <Footer menu={layout?.footerMenu} />
    </div>
  );
}
