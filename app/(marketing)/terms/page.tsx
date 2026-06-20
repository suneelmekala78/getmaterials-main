import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for GetMaterials — rules and guidelines for using the free education platform. Read our policies on content usage, uploads, and accounts.",
  alternates: { canonical: "https://getmaterials.in/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main>
      <section className="bg-gradient-soft">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Terms of Service</h1>
          <p className="text-gray-500">Last updated: 17th May 2026</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-500 leading-relaxed">By accessing or using GetMaterials, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">2. Use of the Platform</h2>
              <p className="text-gray-500 leading-relaxed">GetMaterials provides free educational materials for personal, non-commercial use. You may browse, download, and study from any material on the platform. You may <strong>not</strong> redistribute, resell, or claim authorship of materials created by others.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">3. User Accounts</h2>
              <p className="text-gray-500 leading-relaxed">To upload materials or access certain features, you may need to create an account. You are responsible for maintaining the security of your account credentials. Sharing accounts is not permitted.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">4. Content Upload Policy</h2>
              <p className="text-gray-500 leading-relaxed">Teachers and contributors may upload original educational materials. By uploading, you grant GetMaterials a non-exclusive license to display and distribute the content on the platform. You must own the content or have permission to share it. Copyrighted materials from third parties (textbooks, published works) may not be uploaded without permission.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">5. Prohibited Activities</h2>
              <p className="text-gray-500 leading-relaxed">You may not use the platform for illegal purposes, upload harmful or misleading content, attempt to gain unauthorized access, or interfere with the platform&apos;s operation. Violations may result in account suspension.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">6. Intellectual Property</h2>
              <p className="text-gray-500 leading-relaxed">The GetMaterials platform, including its design, code, and branding, is the intellectual property of the GetMaterials team. Individual study materials remain the property of their respective authors.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">7. Disclaimer</h2>
              <p className="text-gray-500 leading-relaxed">GetMaterials is provided &ldquo;as is&rdquo; without warranties of any kind. While we strive for accuracy, we do not guarantee that all materials are error-free. Use materials at your own discretion.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">8. Changes to Terms</h2>
              <p className="text-gray-500 leading-relaxed">We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance. We will notify users of significant changes.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">9. Contact</h2>
              <p className="text-gray-500 leading-relaxed">For questions about these terms, contact us at <strong>getmaterials.in@gmail.com</strong>.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
