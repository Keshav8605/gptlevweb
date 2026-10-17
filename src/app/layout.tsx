import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Little World For You 💕 | With All My Heart",
  description: "A personal, interactive romantic gift world made with love.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function cleanNode(el) {
                    if (!el || el.nodeType !== 1 || !el.attributes) return;
                    for (var i = el.attributes.length - 1; i >= 0; i--) {
                      var attr = el.attributes[i].name;
                      if (attr === 'bis_skin_checked' || attr === 'bis_register' || attr.indexOf('__processed_') === 0 || attr.indexOf('bis_') === 0) {
                        el.removeAttribute(attr);
                      }
                    }
                  }
                  var obs = new MutationObserver(function(muts) {
                    for (var i = 0; i < muts.length; i++) {
                      var m = muts[i];
                      if (m.type === 'attributes') {
                        cleanNode(m.target);
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          var node = m.addedNodes[j];
                          cleanNode(node);
                          if (node.querySelectorAll) {
                            var children = node.querySelectorAll('*');
                            for (var k = 0; k < children.length; k++) {
                              cleanNode(children[k]);
                            }
                          }
                        }
                      }
                    }
                  });
                  obs.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    childList: true,
                    attributeFilter: ['bis_skin_checked', 'bis_register']
                  });
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-[var(--bg-blush)] selection:text-[var(--text-primary)]"
      >
        {children}
      </body>
    </html>
  );
}
