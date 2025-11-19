// src/pages/portfolio/[id].tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Globe,
  User,
  Briefcase,
  Code,
  ExternalLink,
  GraduationCap,
  Award,
  HeartHandshake,
  Loader2,
  Zap,
  Share2
} from "lucide-react";

// --- Types based on your DB/API schema ---

interface Contact {
  telephone: string;
  mobile: string;
  email: string;
  address: string;
}

interface Profile {
  id: number;
  user_id: number;
  name: string;
  job_title: string;
  tagline: string;
  location: string;
  introduction: string;
  photo_path: string;
  contact: Contact;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_month: string;
  end_month: string;
}

interface Work {
  id: number;
  company: string;
  position: string;
  location: string;
  start_month: string;
  end_month?: string;
  is_present: boolean;
  description: string;
}

interface Language {
  id: number;
  language: string;
  proficiency: string;
}

interface Skill {
  id: number;
  skill: string;
  level?: string;
}

interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  link?: string;
  remark?: string; // e.g. tech stack tags
}

interface Volunteer {
  id: number;
  organization: string;
  role: string;
  start_month: string;
  end_month?: string;
  is_present: boolean;
  description: string;
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
}

interface FullProfileData {
  profile: Profile;
  education: Education[];
  work: Work[];
  language: Language[];
  skill: Skill[];
  certificate: Certificate[];
  project: Project[];
  volunteer: Volunteer[];
  socialLink: SocialLink[];
}

// Helper to ensure contact details are initialized
const emptyContact: Contact = {
  email: "",
  telephone: "",
  mobile: "",
  address: "",
};

const initialData: FullProfileData = {
  profile: {
    id: 0,
    user_id: 0,
    name: "Loading...",
    job_title: "",
    tagline: "",
    location: "",
    introduction: "",
    photo_path: "",
    contact: emptyContact,
  },
  education: [],
  work: [],
  language: [],
  skill: [],
  certificate: [],
  project: [],
  volunteer: [],
  socialLink: [],
};

export default function PortfolioProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profileData, setProfileData] = useState<FullProfileData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait until router is ready & id is available
    if (!router.isReady || !id) return;

    const profileId = Array.isArray(id) ? id[0] : id;

    async function fetchProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portfolio/${profileId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch profile: ${response.statusText}`             
          );
        }

        const data: FullProfileData = await response.json();

        // Normalize contact
        if (data.profile) {
          data.profile.contact = {
            ...emptyContact,
            ...(data.profile.contact || {}),
          };
        }

        setProfileData(data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(
          err.message ||
            "An unknown error occurred while loading the profile. Please check the profile API."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [router.isReady, id]);

  // --- Error state ---
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg border-2 border-red-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-red-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.772-1.333-2.68-1.333-3.452 0L3.32 16c-.772 1.333.19 3 1.732 3z"
            />
          </svg>
          <h2 className="text-lg font-bold text-red-700 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-sm text-slate-600 text-center max-w-sm">{error}</p>
          <p className="text-xs text-slate-400 mt-2">
            Please ensure the backend API for individual portfolio is correctly
            configured.
          </p>
        </div>
      </div>
    );
  }

   // --- Loading state while fetching or waiting for router ---
  if (isLoading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-lg font-medium text-slate-700">
            Loading portfolio...
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Fetching portfolio data from the server.
          </p>
        </div>
      </div>
    );
  }
  
  const { profile, education, work, language, skill, certificate, project, volunteer, socialLink } =
    profileData;

    // --- Main Render (data loaded) ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Static Profile Info */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden sticky top-8">
              {/* Cover Background */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

              {/* Photo & Name */}
              <div className="px-6 relative">
                <div className="-mt-16 mb-4">
                  <img
                    src={
                      profile.photo_path ||
                      "https://placehold.co/128x128/eeeeee/000000?text=Profile"
                    }
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/128x128/eeeeee/000000?text=Profile";
                    }}
                  />
                </div>

                <h1 className="text-2xl font-bold text-slate-900">
                  {profile.name}
                </h1>
                <p className="text-blue-600 font-medium mb-1">
                  {profile.job_title}
                </p>
                {profile.tagline && (
                  <p className="text-slate-500 text-xs italic mb-2">
                    {profile.tagline}
                  </p>
                )}

                {profile.location && (
                  <p className="text-slate-500 text-sm flex items-center gap-2 mb-6">
                    <MapPin className="w-4 h-4" /> {profile.location}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-3 mb-6 border-t border-slate-100 pt-6">
                  {profile.contact.email && (
                    <a
                      href={`mailto:${profile.contact.email}`}
                      className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-sm truncate">
                        {profile.contact.email}
                      </span>
                    </a>
                  )}

                  {profile.contact.mobile && (
                    <a
                      href={`tel:${profile.contact.mobile}`}
                      className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{profile.contact.mobile}</span>
                    </a>
                  )}

                  {profile.contact.telephone && (
                    <a
                      href={`tel:${profile.contact.telephone}`}
                      className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-sm">
                        {profile.contact.telephone}
                      </span>
                    </a>
                  )}

                  {profile.contact.address && (
                    <div className="flex items-start gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mt-1">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-sm leading-tight pt-2">
                        {profile.contact.address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {socialLink && socialLink.length > 0 && (
                  <div className="space-y-3 mb-8 pt-2">
                    {socialLink.map((social) => (
                      <a
                        key={social.id}
                        href={
                          social.url.startsWith("http")
                            ? social.url
                            : `https://${social.url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600">
                          {social.platform.toLowerCase().includes("linkedin") ? (
                            <Linkedin className="w-4 h-4" />
                          ) : social.platform.toLowerCase().includes("github") ? (
                            <Code className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-sm truncate">
                          {social.platform}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills */}
              {skill && skill.length > 0 && (
                <div className="px-6 pb-6 border-t border-slate-100 pt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.map((s) => (
                      <span
                        key={s.id}
                        className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200"
                      >
                        {s.skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {language && language.length > 0 && (
                <div className="px-6 pb-6 border-t border-slate-100 pt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Languages
                  </h3>
                  <div className="space-y-3">
                    {language.map((lang) => (
                      <div
                        key={lang.id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {lang.language}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Dynamic Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {/* About Section */}
            <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="text-blue-600 w-5 h-5" /> About Me
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {profile.introduction || "No introduction provided."}
              </p>
            </section>

            {/* Work Experience */}
            {work && work.length > 0 && (
              <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="text-blue-600 w-5 h-5" /> Work
                  Experience
                </h2>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {work.map((exp) => (
                    <div
                      key={exp.id}
                      className="relative flex items-start group"
                    >
                      <div
                        className={`absolute left-0 md:left-auto ml-2.5 -mt-1.5 h-5 w-5 rounded-full border-4 border-white shadow ${
                          exp.is_present ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      ></div>
                      <div className="ml-10 w-full">
                        <div className="flex flex-wrap justify-between items-baseline mb-2">
                          <h3 className="text-lg font-bold text-slate-800">
                            {exp.position}
                          </h3>
                          <span
                            className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              exp.is_present
                                ? "text-blue-600 bg-blue-50"
                                : "text-slate-500 bg-slate-100"
                            }`}
                          >
                            {exp.start_month} -{" "}
                            {exp.is_present ? "Present" : exp.end_month}
                          </span>
                        </div>
                        <div className="text-slate-600 font-medium mb-2 flex items-center gap-2">
                          <Briefcase className="text-slate-400 w-3 h-3" />{" "}
                          {exp.company}
                          <span className="text-slate-300 mx-1">•</span>
                          <span className="text-sm text-slate-500">
                            {exp.location}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3 whitespace-pre-line">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Grid */}
            {project && project.length > 0 && (
              <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Code className="text-blue-600 w-5 h-5" /> Projects
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.map((proj) => (
                    <div
                      key={proj.id}
                      className="group border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-400 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {proj.title}
                        </h3>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-blue-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3 whitespace-pre-line">
                        {proj.description}
                      </p>
                      {proj.remark && (
                        <div className="flex flex-wrap gap-2">
                          {/* Assuming remark is a comma-separated list of technologies */}
                          {proj.remark.split(",").map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Two Column Section: Education & Certificates */}
            {((education && education.length > 0) ||
              (certificate && certificate.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Education */}
                {education && education.length > 0 && (
                  <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 h-full">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <GraduationCap className="text-blue-600 w-5 h-5" />{" "}
                      Education
                    </h2>
                    <div className="space-y-6">
                      {education.map((edu) => (
                        <div
                          key={edu.id}
                          className="border-l-2 border-blue-200 pl-4 hover:border-blue-600 transition-colors"
                        >
                          <h3 className="font-bold text-slate-800">
                            {edu.degree}
                          </h3>
                          <p className="text-slate-600 text-sm">
                            {edu.institution}
                          </p>
                          <p className="text-slate-500 text-xs mt-1">
                            {edu.field_of_study}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            {edu.start_month} - {edu.end_month}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Certificates */}
                {certificate && certificate.length > 0 && (
                  <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 h-full">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Award className="text-blue-600 w-5 h-5" /> Certifications
                    </h2>
                    <div className="space-y-4">
                      {certificate.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-3">
                          <Award className="text-yellow-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">
                              {cert.title}
                            </h3>
                            <p className="text-slate-500 text-xs">
                              {cert.issuer} •{" "}
                              {cert.expiry_date
                                ? `Exp: ${cert.expiry_date}`
                                : `Issued: ${cert.issue_date}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Volunteering */}
            {volunteer && volunteer.length > 0 && (
              <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <HeartHandshake className="text-blue-600 w-5 h-5" />{" "}
                  Volunteering
                </h2>
                {volunteer.map((vol) => (
                  <div
                    key={vol.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-100 last:border-0 pb-4 last:pb-0 mb-4 last:mb-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800">{vol.role}</h3>
                      <p className="text-slate-600 text-sm">
                        {vol.organization}
                      </p>
                      {vol.description && (
                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
                          {vol.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 mt-2 sm:mt-0 bg-slate-100 px-2 py-1 rounded self-start sm:self-center whitespace-nowrap ml-0 sm:ml-4">
                      {vol.start_month} -{" "}
                      {vol.is_present ? "Present" : vol.end_month}
                    </span>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-400 text-sm pb-8">
          <p>
            &copy; {new Date().getFullYear()} {profile.name}.
          </p>
        </footer>
      </div>
    </div>
  );
}
