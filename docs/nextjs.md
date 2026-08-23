# Using stratum-motion with Next.js

Everything here targets the App Router. The Pages Router works the same way,
minus the server-component boundaries.

## Where the client boundary goes

The components use hooks, so they are client components. Put `'use client'` at
the top of your own wrapper rather than on the page, so the page itself stays a
server component:

```tsx
// components/motion.tsx
'use client';

export { Reveal, Stagger, Parallax, ScrollScene, PageTransition, MotionConfig } from 'stratum-motion';
```

```tsx
// app/page.tsx  — still a server component
import { Reveal } from '@/components/motion';

export default async function Page() {
  const posts = await getPosts();

  return (
    <>
      {posts.map((post) => (
        <Reveal key={post.id} preset="fadeUp">
          <article>{post.title}</article>
        </Reveal>
      ))}
    </>
  );
}
```

The children stay server-rendered; only the wrapper is a client component. This
is exactly the arrangement the library is built for — the server emits the
finished layout, and the client adds the motion afterwards.

## App-wide defaults

```tsx
// app/layout.tsx
import { MotionConfig } from '@/components/motion';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MotionConfig defaultDuration={600} defaultEasing="emphasised">
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
```

## Route transitions

```tsx
// app/template.tsx
'use client';

import { usePathname } from 'next/navigation';
import { PageTransition } from '@/components/motion';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return <PageTransition transitionKey={pathname}>{children}</PageTransition>;
}
```

`template.tsx` rather than `layout.tsx`: a template remounts on navigation,
which is what gives the transition something to react to.

## Turning motion off in tests

Playwright and Cypress runs are steadier when nothing is mid-animation:

```tsx
<MotionConfig disabled={process.env.NEXT_PUBLIC_DISABLE_MOTION === '1'}>
  {children}
</MotionConfig>
```

Every primitive then renders its final state immediately, with no observers and
no frame loop.

## Common mistakes

**A `Reveal` inside a `Suspense` boundary that streams in late.** It works, but
the element may already be in view when it arrives, so it animates immediately
and reads as a flash. Use `once` with a short duration, or skip the reveal on
streamed content.

**Wrapping a whole page in one `Reveal`.** The intersection threshold applies to
the wrapper, so nothing triggers until 20% of the entire page is visible. Reveal
sections, not pages.

**Parallax on a fixed-height hero with no overscan.** The layer moves; its box
does not. Give the image `requiredOverscan(speed, travel)` pixels of bleed, or
`scale(1.1)`, so an edge never shows.
