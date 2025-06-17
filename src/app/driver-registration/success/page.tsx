export default function DriverRegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          Registration Successful!
        </h1>
        <p className="text-gray-600 mb-5">
          Thank you for registering as a driver. Your background check is now being processed.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          You’ll receive an email once your application has been reviewed and approved.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition duration-200"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
