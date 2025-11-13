import Header from "./Header";
import Footer from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* 🔹 Header */}
      <Header />

      {/* 🔸 Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 🔹 Footer */}
      <Footer />
    </div>
  );
};

export default Layout;