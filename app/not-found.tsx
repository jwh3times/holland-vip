import { Cta } from "@/components/ui/cta";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center px-4">
        {/* 404 Number */}
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">Page Not Found</h2>

        {/* Description */}
        <p className="text-lg text-muted max-w-md mx-auto mb-8">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Back to Home Button */}
        <Cta href="/">Back to Home</Cta>
      </div>
    </div>
  );
}
