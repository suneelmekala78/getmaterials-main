import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for GetMaterials — how we collect, use, and protect your personal information. We never sell your data to third parties.",
  alternates: { canonical: "https://getmaterials.in/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main>
      <section className="bg-gradient-soft">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: 17th May 2026</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="max-w-3xl mx-auto px-6 prose prose-gray prose-sm">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
              <p className="text-gray-500 leading-relaxed">
                When you create an account, we collect your name, email address, and password. When you browse materials, we may collect anonymous usage data (pages visited, time spent) to improve the platform. We do <strong>not</strong> sell or share your personal data with third parties.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-500 leading-relaxed">
                Your information is used to provide and improve the GetMaterials platform, send important account notifications, and respond to your feedback or support requests. We may use anonymized, aggregated data to understand platform usage patterns.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">3. Data Storage &amp; Security</h2>
              <p className="text-gray-500 leading-relaxed">
                Your data is stored securely using industry-standard encryption. Passwords are hashed and never stored in plain text. We use HTTPS for all communications between your browser and our servers.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">4. Cookies</h2>
              <p className="text-gray-500 leading-relaxed">
                We use essential cookies to keep you logged in and remember your preferences. We do not use third-party advertising cookies. Analytics cookies (if used) are anonymized.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">5. Third-Party Services</h2>
              <p className="text-gray-500 leading-relaxed">
                We may use third-party services such as MongoDB Atlas for database hosting. These services have their own privacy policies and we ensure they comply with data protection standards.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">6. Your Rights</h2>
              <p className="text-gray-500 leading-relaxed">
                You can request to view, update, or delete your personal data at any time by contacting us at getmaterials.in@gmail.com. You can also delete your account from the app settings.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">7. Changes to This Policy</h2>
              <p className="text-gray-500 leading-relaxed">
                We may update this policy from time to time. Significant changes will be communicated through the platform. Continued use of GetMaterials after changes constitutes acceptance of the updated policy.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">8. Contact</h2>
              <p className="text-gray-500 leading-relaxed">
                If you have questions about this privacy policy, contact us at <strong>getmaterials.in@gmail.com</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
