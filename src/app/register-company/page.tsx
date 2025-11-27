import CompanyRegistrationForm from '@/components/CompanyRegistrationForm';

export default function RegisterCompanyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Register Your <span className="text-sky-500">Company</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of businesses using our platform. Choose your plan and unlock powerful tools.
          </p>
        </div>
        <CompanyRegistrationForm />
      </div>
    </div>
  );
}