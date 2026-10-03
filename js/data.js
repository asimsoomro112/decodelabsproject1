/* CourseHub data — the single source of truth for the catalog.
   Plain script (no modules) so the site works from file:// too. */
(function () {
  "use strict";

  window.CourseHub = window.CourseHub || {};

  CourseHub.data = {
    courses: [
      {
        id: "c1",
        title: "Responsive Web Design Foundations",
        tagline: "Semantic HTML and modern CSS from the ground up.",
        description: "Start where every great interface starts: meaningful markup and CSS that adapts. You'll build three real pages mobile-first and learn why the cascade is a feature, not a bug.",
        category: "HTML & CSS",
        level: "Beginner",
        hours: 12,
        lessons: 48,
        rating: 4.9,
        students: 4820,
        featured: true,
        image: "assets/courses/c1.jpg",
        outcomes: ["Write semantic, accessible HTML without div-soup", "Build mobile-first layouts with Grid and Flexbox", "Ship a three-page responsive site from scratch"]
      },
      {
        id: "c2",
        title: "CSS Grid & Flexbox Mastery",
        tagline: "Two-dimensional and one-dimensional layout, mastered.",
        description: "Grid for the page, Flexbox for the components — and the judgment to know which is which. Dozens of bite-size layout drills that rewire how you see any design.",
        category: "HTML & CSS",
        level: "Beginner",
        hours: 8,
        lessons: 36,
        rating: 4.8,
        students: 3950,
        featured: true,
        image: "assets/courses/c2.jpg",
        outcomes: ["Place anything with Grid template areas", "Align components perfectly with Flexbox", "Recreate complex layouts from screenshots"]
      },
      {
        id: "c3",
        title: "JavaScript: From Zero to Interactive",
        tagline: "Vanilla JavaScript with no frameworks attached.",
        description: "The language beneath every framework. DOM, events, state and fetch — taught through small interactive widgets you'll actually reuse.",
        category: "JavaScript",
        level: "Beginner",
        hours: 16,
        lessons: 64,
        rating: 4.9,
        students: 5210,
        featured: false,
        image: "assets/courses/c3.jpg",
        outcomes: ["Manipulate the DOM with confidence", "Manage UI state without a library", "Build tabs, accordions, filters and dialogs by hand"]
      },
      {
        id: "c4",
        title: "Accessible Interfaces: WCAG in Practice",
        tagline: "Ship interfaces every human can use.",
        description: "Accessibility as a craft, not a checklist. Landmarks, focus, names, contrast and motion — practiced on real components until they're second nature.",
        category: "Accessibility",
        level: "Intermediate",
        hours: 10,
        lessons: 40,
        rating: 4.9,
        students: 2870,
        featured: true,
        image: "https://picsum.photos/id/119/400/225",
        outcomes: ["Audit any page against WCAG 2.2 AA", "Name every interactive element for assistive tech", "Design focus and motion that respect users"]
      },
      {
        id: "c5",
        title: "Design Systems with Vanilla CSS",
        tagline: "Tokens, layers and components without a framework.",
        description: "Build a tiny design system the hard way — custom properties, cascade layers, container queries — so every framework afterward feels easy.",
        category: "Design",
        level: "Intermediate",
        hours: 9,
        lessons: 38,
        rating: 4.7,
        students: 2140,
        featured: false,
        image: "https://picsum.photos/id/2/400/225",
        outcomes: ["Architect a token-driven palette in oklch", "Organize CSS with cascade layers", "Document components others can reuse"]
      },
      {
        id: "c6",
        title: "Performance-First Frontend",
        tagline: "Make pages fast on real devices and networks.",
        description: "Measure first, optimize second. LCP, CLS and INP on mid-range phones — plus the rendering habits that keep them green.",
        category: "Performance",
        level: "Advanced",
        hours: 7,
        lessons: 30,
        rating: 4.8,
        students: 1980,
        featured: false,
        image: "https://picsum.photos/id/180/400/225",
        outcomes: ["Read a Lighthouse report like a mechanic", "Eliminate layout shift at the source", "Budget performance for every new feature"]
      },
      {
        id: "c7",
        title: "SVG & Motion for the Web",
        tagline: "Crisp vector graphics and honest animation.",
        description: "Inline SVG icons, patterns and illustrations, plus animation that respects prefers-reduced-motion. Motion with manners.",
        category: "Design",
        level: "Intermediate",
        hours: 6,
        lessons: 28,
        rating: 4.7,
        students: 1760,
        featured: false,
        image: "https://picsum.photos/id/366/400/225",
        outcomes: ["Hand-write clean inline SVG", "Animate with transforms and opacity only", "Build a reduced-motion-safe animation system"]
      },
      {
        id: "c8",
        title: "Forms, Validation & State",
        tagline: "Forms users can actually complete.",
        description: "The least loved and most important UI on the web. Constraint Validation API, error summaries, and state patterns that never lose a user's work.",
        category: "JavaScript",
        level: "Intermediate",
        hours: 8,
        lessons: 34,
        rating: 4.8,
        students: 2430,
        featured: false,
        image: "https://picsum.photos/id/1/400/225",
        outcomes: ["Validate with the platform before reaching for JS", "Write error messages humans understand", "Persist form state across sessions"]
      },
      {
        id: "c9",
        title: "Capstone: Ship a Portfolio Site",
        tagline: "Put it all together and deploy.",
        description: "One portfolio site, five pages, zero frameworks — designed, built, audited and deployed. Your proof of work for interviews.",
        category: "Capstone",
        level: "Advanced",
        hours: 14,
        lessons: 52,
        rating: 5.0,
        students: 3120,
        featured: false,
        image: "https://picsum.photos/id/20/400/225",
        outcomes: ["Plan a multi-page static site end to end", "Pass your own accessibility and performance audit", "Deploy to static hosting with a custom domain"]
      }
    ]
  };
})();
