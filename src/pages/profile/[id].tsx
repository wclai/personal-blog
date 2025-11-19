// src/pages/profile/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

import { 
  mainShadow, mainSection, mainHeader, sectionHeader, 
  labelStyle , inputStyle , sectionBox , 
  buttonRow , buttonStyle, confirmButtonStyle 
} from "../../styles/globalStyle";
import { ConfirmModal } from "../../components/Modal";
import UploadPhotoModal from "../../components/UploadPhoto";

import EducationSection from "../../components/profile/EducationSection";
import WorkSection from "../../components/profile/WorkSection";
import LanguageSection from "../../components/profile/LanguageSection";
import SkillSection from "../../components/profile/SkillSection";
import CertificateSection from "../../components/profile/CertificateSection";
import ProjectSection from "../../components/profile/ProjectSection";
import VolunteerSection from "../../components/profile/VolunteerSection";
import SocialLinkSection from "../../components/profile/SocialLinkSection";


/* ---------- Types ---------- */
interface ProfileMaster {
  id: number;
  pf_name: string;
  name: string;
  job_title: string;
  tagline: string;
  location: string;
  introduction: string;
  photo_path: string | null;
  temp_photo_id: string | null;
  is_public: boolean;
  contact: {
    telephone: string;
    mobile: string;
    email: string;
    address: string;
  };
}

interface PfEducation {
  id: number | null;
  profile_id: number;
  institution: string;  
  location: string;
  degree: string;
  field_of_study: string;
  start_month: string;
  end_month: string;
  remark: string;
}

interface EducationChange {
  upserts: PfEducation[];
  deleteIds: number[];
  isValid: boolean;
}

interface PfWork {
  id: number | null;
  profile_id: number;
  company: string;
  location: string;
  position: string;
  description: string;
  is_present: boolean;
  start_month: string;
  end_month: string;
  remark: string;
}

interface WorkChange {
  upserts: PfWork[];
  deleteIds: number[];
  isValid: boolean;
}

interface PfLanguage {
  id: number | null;
  profile_id: number;
  language: string;
  proficiency: string;
  remark: string;
}

interface LanguageChange {
  upserts: PfLanguage[];
  deleteIds: number[];
  isValid: boolean;
}

interface PfSkill {
  id: number | null;
  profile_id: number;
  skill: string;
  level: string;
  remark: string;
}

interface SkillChange {
  upserts: PfSkill[];
  deleteIds: number[];
  isValid: boolean;
}

interface PfCertificate {
  id: number | null;
  profile_id: number;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  remark: string;
}

interface CertificateChange {
  upserts: PfCertificate[];
  deleteIds: number[];
  isValid: boolean;
}

interface PfProject {
  id: number | null;
  profile_id: number;
  title: string;
  description: string;
  link: string;
  remark: string;
}

interface ProjectChange {
  upserts: PfProject[];
  deleteIds: number[];
  isValid: boolean;
}

interface PfVolunteer {
  id: number | null;
  profile_id: number;
  organization: string;
  role: string;
  description: string;
  is_present: boolean;
  start_month: string;
  end_month: string;
  remark: string;
}

interface VolunteerChange {
  upserts: PfVolunteer[];
  deleteIds: number[];
  isValid: boolean;
}

interface PfSocialLink {
  id: number | null;
  profile_id: number;
  platform: string;
  url: string;
  remark: string;
}

interface SocialLinkChange {
  upserts: PfSocialLink[];
  deleteIds: number[];
  isValid: boolean;
}

/* Add temp field */
type ProfileMasterWithTemp = ProfileMaster & {
  temp_photo_id: string | null;
};

/* ---------- CLIENT helper functions ---------- */
async function commitPhoto(profileId: number, temp_id: string) {
  const res = await fetch(
    `/api/profile/profile-photo/${profileId}/commit`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ temp_id }),
    }
  );
  if (!res.ok) throw new Error("Commit failed");
  return res.json();
}

/* ---------- Main Component ---------- */
export default function ProfileEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const profileId = Array.isArray(id) ? id[0] : id ?? "";

  const [master, setMaster] = useState<ProfileMaster | null>(null);
  const [masterWithTemp, setMasterWithTemp] = useState<ProfileMasterWithTemp | null>(null);
  const [education, setEducation] = useState<PfEducation[]>([]);
  const [work, setWork] = useState<PfWork[]>([]);
  const [language, setLanguage] = useState<PfLanguage[]>([]);
  const [skill, setSkill] = useState<PfSkill[]>([]);
  const [certificate, setCertificate] = useState<PfCertificate[]>([]);
  const [project, setProject] = useState<PfProject[]>([]);
  const [volunteer, setVolunteer] = useState<PfVolunteer[]>([]);
  const [socialLink, setSocialLink] = useState<PfSocialLink[]>([]);

  const [educationPayload, setEducationPayload] = useState<EducationChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });
  const [workPayload, setWorkPayload] = useState<WorkChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });
  const [languagePayload, setLanguagePayload] = useState<LanguageChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });

  const [skillPayload, setSkillPayload] = useState<SkillChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });
  
  const [certificatePayload, setCertificatePayload] = useState<CertificateChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });
  
  const [projectPayload, setProjectPayload] = useState<ProjectChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });
  
  const [volunteerPayload, setVolunteerPayload] = useState<VolunteerChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });
  
  const [socialLinkPayload, setSocialLinkPayload] = useState<SocialLinkChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });
  
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const [removePhotoModal, setRemovePhotoModal] = useState(false);
  const [confirmReturn, setConfirmReturn] = useState(false);
    
  /* ---------- Auth Check ---------- */
  useEffect(() => {
    if (!loading) {
      setIsAdmin(user?.role === "admin");
      setAuthLoading(false);
    }
  }, [loading, user]);

  /* ---------- Fetch Profile ---------- */
  useEffect(() => {
    if (!id) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        setMaster(data.master);
        setMasterWithTemp(data.master); 
        setEducation(data.education);
        setWork(data.work);
        setLanguage(data.language);
        setSkill(data.skill);
        setCertificate(data.certificate);
        setProject(data.project);
        setVolunteer(data.volunteer);
        setSocialLink(data.socialLink);

      } catch {
        setModal({ open: true, title: "Error", message: "Failed to fetch profile data." });
      }
    }

    fetchProfile();
  }, [id]);

  /* ---------- Save Handler ---------- */
  const handleSave = async () => {
    if (!master || !masterWithTemp) return;

    if (!master.name || !master.pf_name) {
      setModal({
        open: true,
        title: "Validation",
        message: "Profile Name and Full Name are required.",
      });
      return;
    }

    if (educationPayload.isValid === false ||
      workPayload.isValid === false ||
      languagePayload.isValid === false ||
      skillPayload.isValid === false||
      certificatePayload.isValid === false||
      projectPayload.isValid === false||
      volunteerPayload.isValid === false||
      socialLinkPayload.isValid === false
    ) {
      setModal({
        open: true,
        title: "Validation",
        message: "Please check for any incomplete or incorrect input.",
      });
      return;
    }

    for (const row of education) {
      if (row.start_month && row.end_month < row.start_month) {
        alert("End Month must be later or equal to Start Month.");
        return;
      }
    }

    for (const row of work) {
      if (!row.is_present && row.end_month) {
        if (row.start_month && row.end_month < row.start_month) {
          alert("End Month must be later or equal to Start Month.");
          return;
        }
      }
    }

    for (const row of certificate) {
      if (row.expiry_date && row.expiry_date < row.issue_date) {
        alert("Expiry Date must be later or equal to Issue Date.");
        return;
      }
    }

    for (const row of volunteer) {
      if (!row.is_present && row.end_month) {
        if (row.start_month && row.end_month < row.start_month) {
          alert("End Month must be later or equal to Start Month.");
          return;
        }
      }
    }

    setSaving(true);
    try {
      // 1) commit temp photo first
      if (masterWithTemp.temp_photo_id) {
        const result = await commitPhoto(Number(id), masterWithTemp.temp_photo_id);

        // update DB master
        master.photo_path = result.photo_path
        setMaster(prev => prev ? { ...prev, photo_path: result.photo_path } : prev);

        // clear temp
        setMasterWithTemp(prev =>
          prev ? { ...prev, photo_path: result.photo_path, temp_photo_id: null } : prev
        );
      }

      // 2) save profile
      const res = await fetch(`/api/profile/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master,
          education: educationPayload,
          work: workPayload,
          language: languagePayload,
          skill: skillPayload,
          certificate: certificatePayload,
          project: projectPayload,
          volunteer: volunteerPayload,
          socialLink: socialLinkPayload,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setModal({
        open: true,
        title: "Success",
        message: "Profile saved successfully.",
      });
    } catch (err) {
      console.error(err);
      setModal({
        open: true,
        title: "Error",
        message: "Failed to save profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */
  if (authLoading) return <p>Checking auth...</p>;
  if (!isAdmin) return <p>Unauthorized</p>;
  if (!master || !masterWithTemp) return <p>Loading...</p>;

  const currentPhotoSrc = 
    masterWithTemp?.temp_photo_id
      ? `/api/profile/profile-photo/tmp/${masterWithTemp.temp_photo_id}`
      : master?.photo_path
        ? `/api/profile/profile-photo/${profileId}`
        : null;

  return (
    <div style={mainShadow}>
    
      <div style={mainSection}>
        <h1 style={mainHeader}>
          Edit Profile
        </h1>
        <p style={{ marginBottom: 16, fontSize: 14, color: "#555" }}>
          Mandatory field(s) masked with <span style={{ color: "red", fontWeight: "bold" }}>*</span>
        </p>

        {/* ---------- Master Section ---------- */}
        <section style={sectionBox}>
          <h2 style={sectionHeader}>Profile</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={labelStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={master.is_public}
                  onChange={(e) => setMaster({ ...master, is_public: e.target.checked })}
                />
                {"  "}This profile will go public
              </div>
            </label>
            
            <label style={labelStyle}>
              <span>Profile Name<span style={{ color: "red", fontWeight: "bold" }}> *</span></span>
              <input style={inputStyle} value={master.pf_name} onChange={(e) => setMaster({ ...master, pf_name: e.target.value })} />
            </label>

            <label style={labelStyle}>
              <span>Full Name<span style={{ color: "red", fontWeight: "bold" }}> *</span></span>
              <input style={inputStyle} value={master.name} onChange={(e) => setMaster({ ...master, name: e.target.value })} />
            </label>

            <label style={labelStyle}>
              Job Title
              <input style={inputStyle} value={master.job_title} onChange={(e) => setMaster({ ...master, job_title: e.target.value })} />
            </label>

            <label style={labelStyle}>
              Tagline
              <input style={inputStyle} value={master.tagline} onChange={(e) => setMaster({ ...master, tagline: e.target.value })} />
            </label>

            <label style={labelStyle}>
              Location
              <input style={inputStyle} value={master.location} onChange={(e) => setMaster({ ...master, location: e.target.value })} />
            </label>

            <label style={labelStyle}>
              Introduction
              <textarea
                style={{ ...inputStyle, height: 80 }}
                value={master.introduction ?? ""}
                onChange={(e) => setMaster({ ...master, introduction: e.target.value })}
              />
            </label>

            <label style={labelStyle}>
              Photo
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 96, height: 96, borderRadius: 6, overflow: "hidden", border: "1px solid #ddd" }}>
                  {currentPhotoSrc ? (
                    <img src={currentPhotoSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
                      No photo
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button style={buttonStyle} onClick={() => setShowUploadModal(true)}>
                    Upload / Replace
                  </button>
                  <button style={buttonStyle} onClick={() => setRemovePhotoModal(true)}>
                    Remove Photo
                  </button>
                </div>
              </div>
            </label>

          </div>
        </section>
        
        {/* ---------- Contact Section ---------- */}
        <section style={sectionBox}>
          <h2 style={sectionHeader}>Contact Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span></span>
            <label style={labelStyle}>
              Telephone
              <input
                style={inputStyle}
                value={master.contact.telephone}
                onChange={(e) => setMaster({ ...master, contact: { ...master.contact, telephone: e.target.value } })}
              />
            </label>

            <label style={labelStyle}>
              Mobile
              <input
                style={inputStyle}
                value={master.contact.mobile}
                onChange={(e) => setMaster({ ...master, contact: { ...master.contact, mobile: e.target.value } })}
              />
            </label>

            <label style={labelStyle}>
              Email
              <input
                style={inputStyle}
                value={master.contact.email}
                onChange={(e) => setMaster({ ...master, contact: { ...master.contact, email: e.target.value } })}
              />
            </label>

            <label style={labelStyle}>
              Address
              <input
                style={inputStyle}
                value={master.contact.address}
                onChange={(e) => setMaster({ ...master, contact: { ...master.contact, address: e.target.value } })}
              />
            </label>
          </div>
        </section>

        {/* ---------- Education Section ---------- */}
        <EducationSection
          initialRows={education}
          onChange={(packet) => {
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setEducationPayload(normalized);
          }}
        />

        {/* ---------- Work Section ---------- */}
        <WorkSection
          initialRows={work}
          onChange={(packet) => {
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setWorkPayload(normalized);
          }}
        />
        
        {/* ---------- Language Section ---------- */}
        <LanguageSection
          initialRows={language}
          onChange={(packet) => {
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setLanguagePayload(normalized);
          }}
        />

        {/* ---------- Skill Section ---------- */}
        <SkillSection
          initialRows={skill}
          onChange={(packet) => {
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setSkillPayload(normalized);
          }}
        />

        {/* ---------- Certificate Section ---------- */}
        <CertificateSection
          initialRows={certificate}
          onChange={(packet) => {
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setCertificatePayload(normalized);
          }}
        />

        {/* ---------- Project Section ---------- */}
        <ProjectSection
          initialRows={project}
          onChange={(packet) => { 
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setProjectPayload(normalized);
          }}
        />

        {/* ---------- Volunteer Section ---------- */}
        <VolunteerSection
          initialRows={volunteer}
          onChange={(packet) => {
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setVolunteerPayload(normalized);
          }}
        />

        {/* ---------- Social Link Section ---------- */}
        <SocialLinkSection
          initialRows={socialLink}
          onChange={(packet) => {
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setSocialLinkPayload(normalized);
          }}
        />

        <p style={{ marginBottom: 16, fontSize: 14, color: "#555" }}>
          Mandatory field(s) masked with <span style={{ color: "red", fontWeight: "bold" }}>*</span>
        </p>
        
        {/* ---------- Buttons ---------- */}
        <div style={buttonRow}>
          <button style={confirmButtonStyle} onClick={handleSave} disabled={saving}>
            Save
          </button>
          <button style={buttonStyle} onClick={() => {setConfirmReturn(true);}}>
            Return
          </button>
        </div>

        {/* ---------- Modals ---------- */}
        <UploadPhotoModal
          open={showUploadModal}
          profileId={profileId}
          onClose={() => setShowUploadModal(false)}
          onUploaded={(temp_id) => {
            setMasterWithTemp((prev) => prev ? { ...prev, temp_photo_id: temp_id } : null)
          }}
        />

        {/* Remove Photo button */}
        <ConfirmModal
          open={removePhotoModal}
          title="Confirm Remove Photo"
          message="Remove photo?"
          labelClose="Cancel"
          onClose={() => setRemovePhotoModal(false)}
          labelConfirm="Confirm"
          onConfirm={() => {
            // Perform removal
            setMaster(prev =>
              prev ? { ...prev, photo_path: null } : prev
            );
            setMasterWithTemp(prev =>
              prev ? { ...prev, photo_path: null, temp_photo_id: null } : prev
            );
            // Close modal after confirming
            setRemovePhotoModal(false);
          }}
        />

        {/* Save button */}
        <ConfirmModal
          open={modal.open}
          title={modal.title}
          message={modal.message}
          labelClose="OK"
          onClose={() => setModal({ ...modal, open: false })}
        />

        {/* Return button */}
        <ConfirmModal
          open={confirmReturn}
          title="Confirm Return"
          message="Please remember to save before leaving. Are you sure you want to return?"
          labelClose="Cancel"
          onClose={() => setConfirmReturn(false)}
          labelConfirm="Return"
          onConfirm={() => {
            router.push("/profile");
          }}
        />

      </div>
    </div>
  );
}
