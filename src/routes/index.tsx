import { createFileRoute } from "@tanstack/react-router";
import albumHero from "@/assets/album-da-biblia.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Álbum da Bíblia" },
      { name: "description", content: "Álbum da Bíblia — histórias que ensinam, momentos que ficam para sempre." },
      { property: "og:title", content: "Álbum da Bíblia" },
      { property: "og:description", content: "Álbum da Bíblia — histórias que ensinam, momentos que ficam para sempre." },
      { property: "og:image", content: albumHero.url },
      { name: "twitter:image", content: albumHero.url },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <img
        src={albumHero.url}
        alt="Álbum da Bíblia - material digital para famílias e crianças de 4 a 12 anos"
        className="max-w-full rounded-lg shadow-sm"
        width={1200}
        height={800}
      />
    </main>
  );
}
