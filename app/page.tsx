import QRGenerator from '@/components/QRGenerator';

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* High-End Smooth Blue & White Gradient Canvas */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* Core Rich Gradient Mesh with Smooth Uniform Depth */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 0%, #1d4ed8 0%, #2563eb 25%, #60a5fa 50%, #dbeafe 75%, #f8fafc 100%)
            `,
          }}
        />

        {/* Soft Ambient Side Gradients */}
        <div className="absolute -top-12 -left-20 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute -top-12 -right-20 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-3xl" />

        {/* Clean Tech Accent Overlay Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main Container */}
      <div className="w-full flex justify-center items-center max-w-6xl relative z-10 py-2">
        <QRGenerator />
      </div>
    </main>
  );
}
