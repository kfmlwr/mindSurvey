import { Navbar } from "./_components/navigation";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Navbar />
      {children}
    </main>
  );
}
